<?php

namespace App\Services;

use Carbon\Carbon;
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
            $this->report['duration_s'] = now()->diffInSeconds(
                Carbon::parse($this->report['started_at'])
            );

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
     * Sauvegarder la base de données via mysqldump.
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

        // MySQL / MariaDB via mysqldump
        $destDir = $this->workDir.'/database';
        File::ensureDirectoryExists($destDir, 0755);

        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? 3306;
        $database = $config['database'] ?? '';
        $username = $config['username'] ?? '';
        $password = $config['password'] ?? '';
        $dumpFile = $destDir.'/database.sql';

        // Construire la commande mysqldump
        $cmd = sprintf(
            'mysqldump --host=%s --port=%s --user=%s --password=%s --single-transaction --quick %s > %s 2>&1',
            escapeshellarg($host),
            escapeshellarg((string) $port),
            escapeshellarg($username),
            escapeshellarg($password),
            escapeshellarg($database),
            escapeshellarg($dumpFile)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            $error = implode("\n", $output);
            $this->addStep('database', 'FAIL', $error);
            $this->report['errors'][] = "Sauvegarde base de données échouée : {$error}";
        } else {
            $sizeKb = round(File::size($dumpFile) / 1024, 1);
            $this->addStep('database', 'OK', "Dump MySQL : {$database} ({$sizeKb} Ko)");
        }
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
     * Sauvegarder les fichiers de configuration critiques.
     */
    private function backupCriticalFiles(bool $dryRun, bool $verbose): void
    {
        $criticalFiles = [
            base_path('.env') => 'config/.env',
            base_path('composer.json') => 'config/composer.json',
            base_path('composer.lock') => 'config/composer.lock',
            base_path('phpunit.xml') => 'config/phpunit.xml',
            base_path('artisan') => 'config/artisan',
        ];

        if ($dryRun) {
            $this->addStep('critical_files', 'DRY-RUN', count($criticalFiles).' fichiers critiques');

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

        $this->addStep('critical_files', 'OK', "{$count} fichier(s) critique(s) sauvegardé(s)");
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
            $relativePath = substr($filePath, strlen($this->workDir) + 1);

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

        $sizeKb = round(File::size($archivePath) / 1024, 1);
        $this->addStep(
            'archive',
            'OK',
            "Archive : {$archiveName} ({$addedFiles} fichiers, {$sizeKb} Ko)"
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

    // ─── Restauration (méthodes préparées) ───────────────────────────────────

    /**
     * [PRÉPARÉ] Restaurer une sauvegarde complète depuis une archive ZIP.
     *
     * Cette méthode est préparée pour une future implémentation sécurisée.
     * La restauration complète nécessite une intervention manuelle validée.
     *
     * @param  string  $backupId  Identifiant de la sauvegarde à restaurer.
     * @return array Rapport de restauration.
     */
    public function restore(string $backupId): array
    {
        return [
            'success' => false,
            'message' => 'La restauration automatisée n\'est pas encore activée. '
                .'Veuillez restaurer manuellement depuis storage/backups/'.$backupId.'.zip.',
            'backup_id' => $backupId,
        ];
    }

    /**
     * [PRÉPARÉ] Vérifier l'intégrité d'une archive de sauvegarde.
     *
     * @param  string  $backupId  Identifiant de la sauvegarde.
     * @return bool True si l'archive est valide.
     */
    public function verifyBackupIntegrity(string $backupId): bool
    {
        $backupBasePath = config('production.backup.path', 'backups');
        $filePath = storage_path("app/{$backupBasePath}/{$backupId}.zip");

        if (! File::exists($filePath)) {
            return false;
        }

        $zip = new ZipArchive;
        $result = $zip->open($filePath, ZipArchive::CHECKCONS);

        if ($result === true) {
            $zip->close();

            return true;
        }

        return false;
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
