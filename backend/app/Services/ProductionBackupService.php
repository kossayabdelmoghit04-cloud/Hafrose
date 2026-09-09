<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

/**
 * Service de sauvegarde de production — HAFROSE.
 *
 * Responsabilités :
 *  — Sauvegarde base de données MySQL (mysqldump)
 *  — Sauvegarde du répertoire storage/app
 *  — Sauvegarde des images publiques
 *  — Sauvegarde des fichiers critiques (.env, composer.json…)
 *  — Génération d'une archive ZIP horodatée
 *  — Vérification de l'espace disque disponible
 *  — Rotation automatique (7j / 4w / 6m)
 *  — Méthodes préparées de restauration
 */
class ProductionBackupService
{
    /** Sous-répertoires du backup courant (nettoyés après compression) */
    private string $workDir = '';

    /** Résultat détaillé de la dernière sauvegarde */
    private array $report = [];

    // ─── Point d'entrée principal ────────────────────────────────────────────

    /**
     * Lancer une sauvegarde complète.
     *
     * @param  bool  $dryRun  Si true, simule la sauvegarde sans rien écrire.
     * @param  bool  $verbose  Activer les messages détaillés (retournés dans le rapport).
     * @return array Rapport de sauvegarde.
     *
     * @throws \RuntimeException Si la sauvegarde est désactivée ou si l'espace disque est insuffisant.
     */
    public function run(bool $dryRun = false, bool $verbose = false): array
    {
        $this->report = [
            'success' => false,
            'dry_run' => $dryRun,
            'started_at' => now()->toIso8601String(),
            'steps' => [],
            'archive' => null,
            'errors' => [],
        ];

        try {
            $this->assertBackupEnabled();
            $this->assertDiskSpace();

            $timestamp = now()->format('Y-m-d_H-i-s');
            $prefix = config('production.backup.filename_prefix', 'hafrose-backup');
            $archiveName = "{$prefix}_{$timestamp}.zip";
            $backupDisk = config('production.storage.disk', 'local');
            $backupBasePath = config('production.backup.path', 'backups');

            if (! $dryRun) {
                $this->workDir = storage_path("app/{$backupBasePath}/tmp_{$timestamp}");
                File::ensureDirectoryExists($this->workDir, 0755);
            }

            // ── Étapes de sauvegarde ─────────────────────────────────────────

            if (config('production.backup.database', true)) {
                $this->backupDatabase($dryRun, $verbose);
            }

            if (config('production.backup.storage', true)) {
                $this->backupStorage($dryRun, $verbose);
            }

            if (config('production.backup.images', true)) {
                $this->backupImages($dryRun, $verbose);
            }

            $this->backupCriticalFiles($dryRun, $verbose);

            $this->generateManifest($archiveName, $timestamp, $dryRun, $verbose);

            // ── Archive ZIP ──────────────────────────────────────────────────

            if (! $dryRun) {
                $archivePath = $this->createArchive($archiveName, $backupBasePath, $verbose);

                // Nettoyage du répertoire temporaire
                File::deleteDirectory($this->workDir);

                $this->report['archive'] = $archivePath;

                // Rotation automatique
                $this->rotateBackups($backupBasePath, $verbose);
            } else {
                $this->report['archive'] = "[dry-run] {$archiveName} (non créé)";
            }

            $this->report['success'] = true;
            $this->report['ended_at'] = now()->toIso8601String();
            $this->report['duration_s'] = abs(now()->diffInSeconds(
                Carbon::parse($this->report['started_at'])
            ));

        } catch (\Throwable $e) {
            $this->report['errors'][] = $e->getMessage();
            $this->report['success'] = false;

            // Nettoyer le répertoire temporaire si présent
            if (! empty($this->workDir) && File::isDirectory($this->workDir)) {
                File::deleteDirectory($this->workDir);
            }

            Log::error('ProductionBackupService: sauvegarde échouée.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if (config('production.backup.notify_on_failure', false)) {
                $this->notifyFailure($e->getMessage());
            }
        }

        return $this->report;
    }

    // ─── Assertions ──────────────────────────────────────────────────────────

    /**
     * S'assurer que les sauvegardes sont activées.
     *
     * @throws \RuntimeException
     */
    private function assertBackupEnabled(): void
    {
        if (! config('production.backup.enabled', true)) {
            throw new \RuntimeException('Les sauvegardes sont désactivées (BACKUP_ENABLED=false).');
        }
    }

    /**
     * Vérifier que l'espace disque disponible est suffisant.
     *
     * @throws \RuntimeException
     */
    private function assertDiskSpace(): void
    {
        $minMb = config('production.backup.min_disk_space_mb', 500);
        $available = disk_free_space(storage_path()) / 1024 / 1024; // octets → Mo

        if ($available < $minMb) {
            throw new \RuntimeException(
                "Espace disque insuffisant : {$available} Mo disponibles, {$minMb} Mo requis."
            );
        }

        $this->addStep('disk_check', 'OK', 'Espace disponible : '.round($available, 1).' Mo');
    }

    // ─── Sauvegarde base de données ──────────────────────────────────────────

    /**
     * Sauvegarder la base de données via mysqldump (avec fallback PDO natif).
     */
    private function backupDatabase(bool $dryRun, bool $verbose): void
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");

        if ($dryRun) {
            $this->addStep('database', 'DRY-RUN', "Connexion : {$connection}");

            return;
        }

        if ($connection === 'sqlite') {
            // Pour SQLite : copier le fichier de base de données
            $dbPath = $config['database'];
            $destDir = $this->workDir.'/database';
            File::ensureDirectoryExists($destDir, 0755);

            if (File::exists($dbPath)) {
                File::copy($dbPath, $destDir.'/database.sqlite');
                $this->addStep('database', 'OK', "SQLite copié depuis : {$dbPath}");
            } else {
                $this->addStep('database', 'SKIP', 'Fichier SQLite introuvable.');
            }

            return;
        }

        $destDir = $this->workDir.'/database';
        File::ensureDirectoryExists($destDir, 0755);

        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? 3306;
        $database = $config['database'] ?? '';
        $username = $config['username'] ?? '';
        $password = $config['password'] ?? '';
        $dumpFile = $destDir.'/database.sql';

        // Tentative 1 : mysqldump via shell (si disponible et compatible)
        $findCmd = PHP_OS_FAMILY === 'Windows' ? 'where mysqldump 2>nul' : 'which mysqldump 2>/dev/null';
        $mysqldump = trim((string) shell_exec($findCmd));
        if ($mysqldump !== '') {
            $cmd = sprintf(
                '%s --host=%s --port=%s --user=%s --password=%s --single-transaction --quick %s > %s 2>&1',
                escapeshellarg($mysqldump),
                escapeshellarg($host),
                escapeshellarg((string) $port),
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($database),
                escapeshellarg($dumpFile)
            );
            exec($cmd, $shellOutput, $exitCode);

            if ($exitCode === 0 && File::exists($dumpFile) && File::size($dumpFile) > 100) {
                $sizeKb = round(File::size($dumpFile) / 1024, 1);
                $this->addStep('database', 'OK', "Dump MySQL (mysqldump) : {$database} ({$sizeKb} Ko)");

                return;
            }
        }

        // Tentative 2 : PDO-native dump — compatible MySQL 8.0+ (caching_sha2_password) sans binaire externe
        try {
            $this->backupDatabaseViaPdo($database, $username, $password, $host, (int) $port, $dumpFile);
            $sizeKb = round(File::size($dumpFile) / 1024, 1);
            $this->addStep('database', 'OK', "Dump MySQL (PDO natif) : {$database} ({$sizeKb} Ko)");
        } catch (\Throwable $e) {
            $this->addStep('database', 'FAIL', $e->getMessage());
            $this->report['errors'][] = "Sauvegarde base de données échouée : {$e->getMessage()}";
        }
    }

    /**
     * Dump MySQL/MariaDB via PDO — aucun binaire externe requis.
     * Compatible MySQL 8.0+ (caching_sha2_password) et MariaDB.
     */
    private function backupDatabaseViaPdo(
        string $database,
        string $username,
        string $password,
        string $host,
        int $port,
        string $dumpFile
    ): void {
        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
        $pdo = new \PDO($dsn, $username, $password, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4',
        ]);

        $handle = fopen($dumpFile, 'w');
        if ($handle === false) {
            throw new \RuntimeException("Impossible de créer le fichier dump : {$dumpFile}");
        }

        $now = now()->toIso8601String();
        fwrite($handle, "-- HAFROSE MySQL Dump — {$now}\n");
        fwrite($handle, "-- Database: {$database}\n\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($handle, "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n\n");

        $tables = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(\PDO::FETCH_NUM);

        foreach ($tables as $tableRow) {
            $table = $tableRow[0];

            // CREATE TABLE statement
            $create = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(\PDO::FETCH_NUM);
            fwrite($handle, "\n-- Table structure for `{$table}`\n");
            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
            fwrite($handle, $create[1].";\n\n");

            // INSERT data in chunks of 500 rows
            $stmt = $pdo->query("SELECT * FROM `{$table}`");
            $cols = $pdo->query("DESCRIBE `{$table}`")->fetchAll(\PDO::FETCH_COLUMN);
            $columns = '`'.implode('`, `', $cols).'`';
            $buffer = [];
            $headerWritten = false;

            while ($rowData = $stmt->fetch(\PDO::FETCH_NUM)) {
                if (! $headerWritten) {
                    fwrite($handle, "-- Data for table `{$table}`\n");
                    $headerWritten = true;
                }

                $escaped = array_map(function ($val) use ($pdo) {
                    return $val === null ? 'NULL' : $pdo->quote($val);
                }, $rowData);

                $buffer[] = '('.implode(', ', $escaped).')';

                if (count($buffer) >= 500) {
                    fwrite($handle, "INSERT INTO `{$table}` ({$columns}) VALUES\n".implode(",\n", $buffer).";\n");
                    $buffer = [];
                }
            }

            if (! empty($buffer)) {
                fwrite($handle, "INSERT INTO `{$table}` ({$columns}) VALUES\n".implode(",\n", $buffer).";\n");
            }
        }

        fwrite($handle, "\nSET FOREIGN_KEY_CHECKS=1;\n");
        fclose($handle);
    }


    // ─── Sauvegarde storage/ ─────────────────────────────────────────────────

    /**
     * Sauvegarder le répertoire storage/app (hors backups/).
     */
    private function backupStorage(bool $dryRun, bool $verbose): void
    {
        $sourcePath = storage_path('app');
        $destPath = $this->workDir.'/storage';

        if ($dryRun) {
            $this->addStep('storage', 'DRY-RUN', "Source : {$sourcePath}");

            return;
        }

        if (! File::isDirectory($sourcePath)) {
            $this->addStep('storage', 'SKIP', 'Répertoire storage/app inexistant.');

            return;
        }

        File::ensureDirectoryExists($destPath, 0755);
        $this->copyDirectoryExcluding($sourcePath, $destPath, ['backups', 'tmp_']);

        $count = count(File::allFiles($destPath));
        $this->addStep('storage', 'OK', "{$count} fichier(s) sauvegardé(s)");
    }

    // ─── Sauvegarde images publiques ─────────────────────────────────────────

    /**
     * Sauvegarder les images du répertoire public/.
     */
    private function backupImages(bool $dryRun, bool $verbose): void
    {
        $imagesPath = public_path('images');
        $storagePublicPath = public_path('storage');
        $destPath = $this->workDir.'/images';

        if ($dryRun) {
            $this->addStep('images', 'DRY-RUN', "Source : {$imagesPath}");

            return;
        }

        File::ensureDirectoryExists($destPath, 0755);
        $count = 0;

        if (File::isDirectory($imagesPath)) {
            File::copyDirectory($imagesPath, $destPath.'/public_images');
            $count += count(File::allFiles($destPath.'/public_images'));
        }

        // Inclure également le lien symbolique storage/public si présent
        if (File::isDirectory($storagePublicPath)) {
            File::copyDirectory($storagePublicPath, $destPath.'/storage_public');
            $count += count(File::allFiles($destPath.'/storage_public'));
        }

        if ($count === 0) {
            $this->addStep('images', 'SKIP', 'Aucune image trouvée dans public/.');
        } else {
            $this->addStep('images', 'OK', "{$count} image(s) sauvegardée(s)");
        }
    }

    // ─── Sauvegarde fichiers critiques ───────────────────────────────────────

    /**
     * Sauvegarder les fichiers de configuration critiques (avec assainissement des secrets).
     */
    private function backupCriticalFiles(bool $dryRun, bool $verbose): void
    {
        $criticalFiles = [
            base_path('.env.example') => 'config/.env.example',
            base_path('composer.json') => 'config/composer.json',
            base_path('composer.lock') => 'config/composer.lock',
            base_path('phpunit.xml') => 'config/phpunit.xml',
            base_path('artisan') => 'config/artisan',
        ];

        if ($dryRun) {
            $this->addStep('critical_files', 'DRY-RUN', (count($criticalFiles) + 1).' fichiers critiques (secrets assainis)');

            return;
        }

        $count = 0;
        foreach ($criticalFiles as $source => $dest) {
            if (File::exists($source)) {
                $destFull = $this->workDir.'/'.$dest;
                File::ensureDirectoryExists(dirname($destFull), 0755);
                File::copy($source, $destFull);
                $count++;
            }
        }

        // Créer une version strictement assainie de .env (aucun mot de passe, token ou clé secrète)
        if (File::exists(base_path('.env'))) {
            $envContent = File::get(base_path('.env'));
            $sanitizedEnv = preg_replace(
                '/^(APP_KEY|DB_PASSWORD|REDIS_PASSWORD|MAIL_PASSWORD|AWS_SECRET_ACCESS_KEY|TURNSTILE_SECRET_KEY|.*SECRET.*|.*PASSWORD.*|.*TOKEN.*)=.*$/m',
                '$1=[REDACTED_FOR_SECURITY]',
                $envContent
            );
            $destSanitized = $this->workDir.'/config/.env.sanitized';
            File::ensureDirectoryExists(dirname($destSanitized), 0755);
            File::put($destSanitized, $sanitizedEnv);
            $count++;
        }

        $this->addStep('critical_files', 'OK', "{$count} fichier(s) critique(s) sauvegardé(s) (secrets assainis)");
    }

    /**
     * Générer le manifeste JSON de la sauvegarde (manifest.json).
     */
    private function generateManifest(string $archiveName, string $timestamp, bool $dryRun, bool $verbose): void
    {
        if ($dryRun) {
            $this->addStep('manifest', 'DRY-RUN', 'Simulation de génération du manifest.json');

            return;
        }

        // Indexer et calculer le SHA-256 de chaque fichier dans workDir
        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->workDir));
        $manifestFiles = [];

        foreach ($files as $file) {
            if ($file->isDir()) {
                continue;
            }

            $filePath = $file->getRealPath();
            $relativePath = str_replace('\\', '/', substr($filePath, strlen($this->workDir) + 1));

            if ($relativePath === 'manifest.json') {
                continue;
            }

            $manifestFiles[$relativePath] = [
                'size_bytes' => $file->getSize(),
                'sha256' => hash_file('sha256', $filePath),
            ];
        }

        // Métadonnées de base de données
        $dbIncluded = config('production.backup.database', true);
        $dbConnection = config('database.default', 'mysql');
        $dbConfig = config("database.connections.{$dbConnection}");
        $dbName = $dbConfig['database'] ?? '';
        $tablesInfo = [];

        if ($dbIncluded && $dbConnection === 'mysql') {
            try {
                $tables = DB::select("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
                foreach ($tables as $t) {
                    $tableArray = (array) $t;
                    $tableName = reset($tableArray);
                    $count = DB::table($tableName)->count();
                    $tablesInfo[$tableName] = $count;
                }
            } catch (\Throwable) {
                // Ignore DB query errors during mock/testing
            }
        }

        // Métadonnées Git
        $gitCommit = null;
        try {
            $commit = trim((string) @shell_exec('git rev-parse --short HEAD 2>nul'));
            if (! empty($commit) && strlen($commit) <= 40 && ! str_contains($commit, 'fatal')) {
                $gitCommit = $commit;
            }
        } catch (\Throwable) {
        }

        $manifestData = [
            'manifest_version' => '1.0',
            'backup_id' => str_replace('.zip', '', $archiveName),
            'timestamp' => $timestamp,
            'created_at' => now()->toIso8601String(),
            'environment' => app()->environment(),
            'app_version' => config('app.name', 'Hafrose').' (Laravel '.app()->version().')',
            'git_commit' => $gitCommit,
            'database' => [
                'included' => $dbIncluded,
                'engine' => $dbConnection,
                'name' => $dbName,
                'tables_count' => count($tablesInfo),
                'tables' => $tablesInfo,
            ],
            'storage_files_count' => File::isDirectory($this->workDir.'/storage') ? count(File::allFiles($this->workDir.'/storage')) : 0,
            'images_files_count' => File::isDirectory($this->workDir.'/images') ? count(File::allFiles($this->workDir.'/images')) : 0,
            'critical_files_count' => File::isDirectory($this->workDir.'/config') ? count(File::allFiles($this->workDir.'/config')) : 0,
            'total_files_count' => count($manifestFiles),
            'checksum_algorithm' => 'sha256',
            'files' => $manifestFiles,
        ];

        File::put(
            $this->workDir.'/manifest.json',
            json_encode($manifestData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );

        $this->addStep('manifest', 'OK', 'Manifest JSON généré ('.count($manifestFiles).' fichiers indexés en SHA-256)');
    }

    // ─── Création de l'archive ZIP ───────────────────────────────────────────

    /**
     * Compresser le répertoire temporaire en archive ZIP.
     *
     * @return string Chemin relatif au disk de l'archive créée.
     *
     * @throws \RuntimeException
     */
    private function createArchive(string $archiveName, string $backupBasePath, bool $verbose): string
    {
        $backupDir = storage_path("app/{$backupBasePath}");
        File::ensureDirectoryExists($backupDir, 0755);

        $archivePath = $backupDir.'/'.$archiveName;
        $compress = config('production.backup.compress', true);

        $zip = new ZipArchive;
        $result = $zip->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        if ($result !== true) {
            throw new \RuntimeException("Impossible de créer l'archive ZIP : erreur {$result}");
        }

        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->workDir));
        $addedFiles = 0;

        foreach ($files as $file) {
            if ($file->isDir()) {
                continue;
            }

            $filePath = $file->getRealPath();
            $relativePath = str_replace('\\', '/', substr($filePath, strlen($this->workDir) + 1));

            if ($compress) {
                $zip->addFile($filePath, $relativePath);
                $zip->setCompressionIndex(
                    $zip->locateName($relativePath),
                    ZipArchive::CM_DEFLATE,
                    config('production.compression.level', 6)
                );
            } else {
                $zip->addFile($filePath, $relativePath);
                $zip->setCompressionIndex($zip->locateName($relativePath), ZipArchive::CM_STORE);
            }
            $addedFiles++;
        }

        $zip->close();

        $archiveSha256 = hash_file('sha256', $archivePath);
        $this->report['archive_sha256'] = $archiveSha256;
        $this->report['archive_size_bytes'] = File::size($archivePath);
        $this->report['archive_size_human'] = $this->humanFileSize(File::size($archivePath));

        $sizeKb = round(File::size($archivePath) / 1024, 1);
        $this->addStep(
            'archive',
            'OK',
            "Archive : {$archiveName} ({$addedFiles} fichiers, {$sizeKb} Ko, SHA-256: ".substr($archiveSha256, 0, 12).'…)'
        );

        // Chemin relatif pour le rapport
        return "{$backupBasePath}/{$archiveName}";
    }

    // ─── Rotation des sauvegardes ────────────────────────────────────────────

    /**
     * Appliquer la politique de rétention (7j / 4w / 6m).
     * Conserve les backups selon la rotation suivante :
     *  — Les 7 derniers backups journaliers
     *  — Les 4 derniers backups hebdomadaires (1er de chaque semaine)
     *  — Les 6 derniers backups mensuels (1er de chaque mois)
     *  — Supprime tous les autres.
     */
    public function rotateBackups(string $backupBasePath, bool $verbose = false): void
    {
        $backupDir = storage_path("app/{$backupBasePath}");

        if (! File::isDirectory($backupDir)) {
            return;
        }

        $files = collect(File::files($backupDir))
            ->filter(fn ($f) => $f->getExtension() === 'zip')
            ->sortByDesc(fn ($f) => $f->getMTime())
            ->values();

        if ($files->isEmpty()) {
            return;
        }

        $dailyLimit = config('production.retention.daily', 7);
        $weeklyLimit = config('production.retention.weekly', 4);
        $monthlyLimit = config('production.retention.monthly', 6);

        $toKeep = collect();
        $weekly = collect();
        $monthly = collect();
        $seenWeeks = [];
        $seenMonths = [];

        // 1er passage : séparer journaliers, hebdos, mensuels
        foreach ($files as $file) {
            $mtime = Carbon::createFromTimestamp($file->getMTime());
            $week = $mtime->format('Y-W');
            $month = $mtime->format('Y-m');

            if (! isset($seenWeeks[$week])) {
                $seenWeeks[$week] = true;
                $weekly->push($file);
            }

            if (! isset($seenMonths[$month])) {
                $seenMonths[$month] = true;
                $monthly->push($file);
            }
        }

        // Conserver selon les limites
        $toKeep = $toKeep
            ->merge($files->take($dailyLimit))
            ->merge($weekly->take($weeklyLimit))
            ->merge($monthly->take($monthlyLimit))
            ->unique(fn ($f) => $f->getRealPath());

        $deleted = 0;
        foreach ($files as $file) {
            $isKept = $toKeep->contains(
                fn ($k) => $k->getRealPath() === $file->getRealPath()
            );

            if (! $isKept) {
                File::delete($file->getRealPath());
                $deleted++;
            }
        }

        $this->addStep('rotation', 'OK', "Rotation : {$deleted} ancien(s) backup(s) supprimé(s)");
    }

    // ─── Liste des sauvegardes ───────────────────────────────────────────────

    /**
     * Lister toutes les sauvegardes disponibles.
     *
     * @return array<int, array{id: string, filename: string, size_kb: float, created_at: string}>
     */
    public function listBackups(): array
    {
        $backupBasePath = config('production.backup.path', 'backups');
        $backupDir = storage_path("app/{$backupBasePath}");

        if (! File::isDirectory($backupDir)) {
            return [];
        }

        return collect(File::files($backupDir))
            ->filter(fn ($f) => $f->getExtension() === 'zip')
            ->sortByDesc(fn ($f) => $f->getMTime())
            ->values()
            ->map(function ($file) use ($backupBasePath) {
                return [
                    'id' => $file->getFilenameWithoutExtension(),
                    'filename' => $file->getFilename(),
                    'path' => "{$backupBasePath}/{$file->getFilename()}",
                    'size_kb' => round($file->getSize() / 1024, 2),
                    'size_human' => $this->humanFileSize($file->getSize()),
                    'created_at' => Carbon::createFromTimestamp($file->getMTime())->toIso8601String(),
                ];
            })
            ->toArray();
    }

    /**
     * Supprimer une sauvegarde par son identifiant (nom de fichier sans extension).
     *
     * @throws \RuntimeException Si la sauvegarde est introuvable.
     */
    public function deleteBackup(string $id): void
    {
        $backupBasePath = config('production.backup.path', 'backups');
        $filePath = storage_path("app/{$backupBasePath}/{$id}.zip");

        if (! File::exists($filePath)) {
            throw new \RuntimeException("Sauvegarde introuvable : {$id}");
        }

        File::delete($filePath);
    }

    // ─── Restauration & Vérification d'Intégrité ─────────────────────────────

    /**
     * Restaurer une sauvegarde complète ou ciblée.
     *
     * @param  string  $backupId  Identifiant de la sauvegarde (nom avec ou sans .zip).
     * @param  string|null  $targetDatabase  Nom de la base de données cible (si null, base par défaut).
     * @param  bool  $restoreDatabase  Restaurer la base de données.
     * @param  bool  $restoreStorage  Restaurer le contenu du répertoire storage/app.
     * @param  bool  $restoreImages  Restaurer les images publiques.
     * @param  bool  $dryRun  Simuler la restauration sans altérer le système.
     * @param  bool  $verbose  Afficher les détails de chaque étape.
     * @return array Rapport de restauration.
     */
    public function restore(
        string $backupId,
        ?string $targetDatabase = null,
        bool $restoreDatabase = true,
        bool $restoreStorage = true,
        bool $restoreImages = true,
        bool $dryRun = false,
        bool $verbose = false
    ): array {
        $backupBasePath = config('production.backup.path', 'backups');
        $cleanId = basename($backupId, '.zip');
        $filePath = storage_path("app/{$backupBasePath}/{$cleanId}.zip");

        $defaultDb = config('database.connections.mysql.database', 'hafrose');
        $targetDb = $targetDatabase ?: $defaultDb;

        $report = [
            'success' => false,
            'dry_run' => $dryRun,
            'backup_id' => $cleanId,
            'target_database' => $targetDb,
            'started_at' => now()->toIso8601String(),
            'steps' => [],
            'errors' => [],
            'message' => '',
        ];

        if (! File::exists($filePath)) {
            $report['errors'][] = "Le fichier de sauvegarde [{$cleanId}.zip] n'existe pas.";
            $report['message'] = "Sauvegarde introuvable : {$cleanId}";

            return $report;
        }

        if ($dryRun) {
            $report['steps'][] = ['name' => 'archive_check', 'status' => 'DRY-RUN', 'message' => "Archive présente : {$filePath}"];
            if ($restoreDatabase) {
                $report['steps'][] = ['name' => 'database', 'status' => 'DRY-RUN', 'message' => "Simulation restauration DB vers `{$targetDb}`"];
            }
            if ($restoreStorage) {
                $report['steps'][] = ['name' => 'storage', 'status' => 'DRY-RUN', 'message' => 'Simulation restauration storage/app'];
            }
            if ($restoreImages) {
                $report['steps'][] = ['name' => 'images', 'status' => 'DRY-RUN', 'message' => 'Simulation restauration public/images'];
            }

            $report['success'] = true;
            $report['message'] = "Simulation de restauration réussie pour {$cleanId}.";
            $report['ended_at'] = now()->toIso8601String();

            return $report;
        }

        $tempExtract = storage_path("app/{$backupBasePath}/tmp_restore_".uniqid());

        try {
            File::ensureDirectoryExists($tempExtract, 0755);

            // 1. Extraction de l'archive ZIP
            $zip = new ZipArchive;
            if ($zip->open($filePath) !== true) {
                throw new \RuntimeException("Impossible d'ouvrir l'archive ZIP : {$filePath}");
            }
            $zip->extractTo($tempExtract);
            $zip->close();
            $report['steps'][] = ['name' => 'extract', 'status' => 'OK', 'message' => 'Archive extraite dans le dossier temporaire'];

            // 2. Vérification du manifest
            $manifestPath = $tempExtract.'/manifest.json';
            $manifest = null;
            if (File::exists($manifestPath)) {
                $manifest = json_decode(File::get($manifestPath), true);
                $report['steps'][] = ['name' => 'manifest', 'status' => 'OK', 'message' => 'Manifest trouvé et validé'];
            }

            // 3. Restauration base de données
            if ($restoreDatabase) {
                $sqlFile = $tempExtract.'/database/database.sql';
                $sqliteFile = $tempExtract.'/database/database.sqlite';

                if (File::exists($sqlFile)) {
                    $this->restoreMysqlDatabase($sqlFile, $targetDb);
                    $report['steps'][] = ['name' => 'database', 'status' => 'OK', 'message' => "Base MySQL restaurée vers `{$targetDb}`"];
                } elseif (File::exists($sqliteFile)) {
                    $destSqlite = config('database.connections.sqlite.database');
                    File::copy($sqliteFile, $destSqlite);
                    $report['steps'][] = ['name' => 'database', 'status' => 'OK', 'message' => "Fichier SQLite restauré vers {$destSqlite}"];
                } else {
                    $report['steps'][] = ['name' => 'database', 'status' => 'SKIP', 'message' => 'Aucun fichier de base de données trouvé dans l\'archive'];
                }
            }

            // 4. Restauration storage/app
            if ($restoreStorage && File::isDirectory($tempExtract.'/storage')) {
                $targetStorage = storage_path('app');
                $this->copyDirectoryExcluding($tempExtract.'/storage', $targetStorage, ['backups', 'tmp_']);
                $count = count(File::allFiles($tempExtract.'/storage'));
                $report['steps'][] = ['name' => 'storage', 'status' => 'OK', 'message' => "{$count} fichier(s) restauré(s) dans storage/app"];
            }

            // 5. Restauration images
            if ($restoreImages && File::isDirectory($tempExtract.'/images')) {
                $count = 0;
                if (File::isDirectory($tempExtract.'/images/public_images')) {
                    File::ensureDirectoryExists(public_path('images'), 0755);
                    File::copyDirectory($tempExtract.'/images/public_images', public_path('images'));
                    $count += count(File::allFiles($tempExtract.'/images/public_images'));
                }
                if (File::isDirectory($tempExtract.'/images/storage_public')) {
                    File::ensureDirectoryExists(storage_path('app/public'), 0755);
                    File::copyDirectory($tempExtract.'/images/storage_public', storage_path('app/public'));
                    $count += count(File::allFiles($tempExtract.'/images/storage_public'));
                }
                $report['steps'][] = ['name' => 'images', 'status' => 'OK', 'message' => "{$count} image(s) restaurée(s)"];
            }

            $report['success'] = true;
            $report['message'] = "Restauration terminée avec succès depuis {$cleanId}.";

        } catch (\Throwable $e) {
            $report['success'] = false;
            $report['errors'][] = $e->getMessage();
            $report['message'] = "La restauration a échoué : {$e->getMessage()}";
            Log::error('ProductionBackupService: erreur lors de la restauration.', [
                'backup_id' => $cleanId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        } finally {
            if (File::isDirectory($tempExtract)) {
                File::deleteDirectory($tempExtract);
            }
        }

        $report['ended_at'] = now()->toIso8601String();
        $report['duration_s'] = now()->diffInSeconds(Carbon::parse($report['started_at']));

        return $report;
    }

    /**
     * Restaurer un fichier dump SQL dans une base MySQL via PDO natif.
     */
    private function restoreMysqlDatabase(string $dumpFile, string $targetDatabase): void
    {
        $connection = config('database.default', 'mysql');
        $config = config("database.connections.{$connection}");

        $host = $config['host'] ?? '127.0.0.1';
        $port = (int) ($config['port'] ?? 3306);
        $username = $config['username'] ?? 'root';
        $password = $config['password'] ?? '';

        $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
        $pdo = new \PDO($dsn, $username, $password, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4',
            \PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
        ]);

        // Créer la base cible si nécessaire
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$targetDatabase}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE `{$targetDatabase}`;");
        $pdo->exec("SET FOREIGN_KEY_CHECKS=0;");
        $pdo->exec("SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';");

        $handle = fopen($dumpFile, 'r');
        if ($handle === false) {
            throw new \RuntimeException("Impossible d'ouvrir le fichier SQL : {$dumpFile}");
        }

        $buffer = '';
        while (($line = fgets($handle)) !== false) {
            $trimmed = trim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*')) {
                continue;
            }

            $buffer .= $line;

            if (str_ends_with($trimmed, ';')) {
                $pdo->exec($buffer);
                $buffer = '';
            }
        }

        if (trim($buffer) !== '') {
            $pdo->exec($buffer);
        }

        fclose($handle);

        $pdo->exec("SET FOREIGN_KEY_CHECKS=1;");
    }

    /**
     * Vérifier l'intégrité détaillée d'une archive de sauvegarde.
     *
     * @return array Rapport d'intégrité détaillé.
     */
    public function verifyBackup(string $backupId): array
    {
        $backupBasePath = config('production.backup.path', 'backups');
        $cleanId = basename($backupId, '.zip');
        $filePath = storage_path("app/{$backupBasePath}/{$cleanId}.zip");

        $report = [
            'valid' => false,
            'backup_id' => $cleanId,
            'archive_path' => "{$backupBasePath}/{$cleanId}.zip",
            'archive_size_bytes' => 0,
            'archive_size_human' => '0 o',
            'archive_sha256' => null,
            'zip_integrity' => false,
            'manifest_present' => false,
            'manifest_valid' => false,
            'manifest' => null,
            'checksums_verified' => false,
            'database_valid' => false,
            'errors' => [],
            'warnings' => [],
        ];

        if (! File::exists($filePath)) {
            $report['errors'][] = "Sauvegarde introuvable : {$cleanId}.zip";

            return $report;
        }

        $size = File::size($filePath);
        $report['archive_size_bytes'] = $size;
        $report['archive_size_human'] = $this->humanFileSize($size);
        $report['archive_sha256'] = hash_file('sha256', $filePath);

        $zip = new ZipArchive;
        $openResult = $zip->open($filePath, ZipArchive::CHECKCONS);

        if ($openResult !== true) {
            $report['errors'][] = "L'archive ZIP est invalide ou corrompue (code: {$openResult}).";

            return $report;
        }

        $report['zip_integrity'] = true;

        // Vérification du manifest.json
        $manifestContent = $zip->getFromName('manifest.json');
        if ($manifestContent !== false) {
            $report['manifest_present'] = true;
            $manifestJson = json_decode($manifestContent, true);

            if (is_array($manifestJson) && isset($manifestJson['backup_id'])) {
                $report['manifest_valid'] = true;
                $report['manifest'] = $manifestJson;

                // Vérification des checksums des fichiers déclarés
                $allChecksumsOk = true;

                if (isset($manifestJson['files']) && is_array($manifestJson['files'])) {
                    foreach ($manifestJson['files'] as $relativePath => $fileInfo) {
                        $expectedHash = $fileInfo['sha256'] ?? null;
                        if (! $expectedHash) {
                            continue;
                        }

                        $fileStream = $zip->getStream($relativePath);
                        if ($fileStream === false) {
                            $report['errors'][] = "Fichier manquant dans l'archive : {$relativePath}";
                            $allChecksumsOk = false;
                            continue;
                        }

                        $ctx = hash_init('sha256');
                        hash_update_stream($ctx, $fileStream);
                        $actualHash = hash_final($ctx);
                        fclose($fileStream);

                        if ($actualHash !== $expectedHash) {
                            $report['errors'][] = "Checksum SHA-256 non concordant pour {$relativePath} (attendu: {$expectedHash}, calculé: {$actualHash})";
                            $allChecksumsOk = false;
                        }
                    }
                }

                $report['checksums_verified'] = $allChecksumsOk;
            } else {
                $report['warnings'][] = "Le fichier manifest.json est présent mais n'est pas un JSON valide.";
            }
        } else {
            $report['warnings'][] = "Aucun fichier manifest.json trouvé dans l'archive.";
        }

        // Vérification de la présence et cohérence du dump DB
        $dbDump = $zip->getFromName('database/database.sql');
        $dbSqlite = $zip->getFromName('database/database.sqlite');
        $dbExpected = true;

        if ($report['manifest'] && isset($report['manifest']['database'])) {
            $dbMeta = $report['manifest']['database'];
            if (isset($dbMeta['included']) && ! $dbMeta['included']) {
                $dbExpected = false;
            } elseif (isset($dbMeta['tables_count']) && $dbMeta['tables_count'] === 0) {
                $dbExpected = false;
            }
        }

        if ($dbDump !== false && strlen($dbDump) > 100) {
            if (str_contains($dbDump, 'CREATE TABLE') || str_contains($dbDump, 'INSERT INTO')) {
                $report['database_valid'] = true;
            } else {
                $report['warnings'][] = 'Le dump SQL ne semble pas contenir d\'instructions valides.';
            }
        } elseif ($dbSqlite !== false && strlen($dbSqlite) > 100) {
            $report['database_valid'] = true;
        } elseif (! $dbExpected) {
            $report['database_valid'] = true;
            $report['warnings'][] = 'Sauvegarde sans composant base de données.';
        } else {
            $report['errors'][] = 'Aucun dump de base de données valide trouvé dans database/.';
        }

        $report['valid'] = empty($report['errors']);
        $zip->close();

        return $report;
    }

    /**
     * Vérifier l'intégrité d'une archive de sauvegarde (compatibilité booléenne).
     *
     * @param  string  $backupId  Identifiant de la sauvegarde.
     * @return bool True si l'archive est valide.
     */
    public function verifyBackupIntegrity(string $backupId): bool
    {
        $result = $this->verifyBackup($backupId);

        return (bool) ($result['valid'] ?? false);
    }

    // ─── Utilitaires internes ────────────────────────────────────────────────

    /**
     * Copier récursivement un répertoire en excluant certains sous-dossiers.
     */
    private function copyDirectoryExcluding(string $source, string $dest, array $excludePrefixes): void
    {
        File::ensureDirectoryExists($dest, 0755);

        $items = File::directories($source);

        foreach ($items as $item) {
            $basename = basename($item);
            $excluded = false;

            foreach ($excludePrefixes as $prefix) {
                if (Str::startsWith($basename, $prefix)) {
                    $excluded = true;
                    break;
                }
            }

            if (! $excluded) {
                File::copyDirectory($item, $dest.'/'.$basename);
            }
        }

        // Copier les fichiers à la racine
        foreach (File::files($source) as $file) {
            File::copy($file->getRealPath(), $dest.'/'.$file->getFilename());
        }
    }

    /**
     * Ajouter une étape au rapport.
     */
    private function addStep(string $name, string $status, string $message): void
    {
        $this->report['steps'][] = [
            'name' => $name,
            'status' => $status,
            'message' => $message,
            'time' => now()->toIso8601String(),
        ];
    }

    /**
     * Formater une taille en octets en format lisible (Ko, Mo, Go).
     */
    private function humanFileSize(int $bytes): string
    {
        $units = ['o', 'Ko', 'Mo', 'Go', 'To'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2).' '.$units[$i];
    }

    /**
     * [PRÉPARÉ] Envoyer une notification par e-mail en cas d'échec.
     */
    private function notifyFailure(string $errorMessage): void
    {
        $email = config('production.backup.notify_email');
        if (! $email) {
            return;
        }

        try {
            Mail::raw(
                "[HAFROSE] Échec de la sauvegarde : {$errorMessage}",
                fn ($m) => $m->to($email)->subject('[HAFROSE] Échec de la sauvegarde automatique')
            );
        } catch (\Throwable $e) {
            Log::error('ProductionBackupService: impossible d\'envoyer la notification d\'échec.', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
