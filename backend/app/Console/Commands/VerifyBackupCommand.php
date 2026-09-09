<?php

namespace App\Console\Commands;

use App\Services\ProductionBackupService;
use Illuminate\Console\Command;

/**
 * Commande Artisan : hafrose:backup:verify
 *
 * Vérifie l'intégrité détaillée d'une sauvegarde HAFROSE locale :
 *   - Existence du fichier
 *   - Cohérence de l'archive ZIP
 *   - Présence et validité de manifest.json
 *   - Concordance des hachages SHA-256 de chaque fichier
 *   - Validité syntaxique et structurelle du dump de base de données
 *
 * Usage :
 *   php artisan hafrose:backup:verify
 *   php artisan hafrose:backup:verify --latest
 *   php artisan hafrose:backup:verify hafrose-backup_2026-09-09_12-00-00
 */
class VerifyBackupCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:backup:verify
        {backup_id? : Identifiant de la sauvegarde (nom sans .zip)}
        {--latest : Vérifier la sauvegarde la plus récente}';

    /**
     * Description de la commande.
     */
    protected $description = 'Vérifier l\'intégrité et la validité d\'une sauvegarde locale HAFROSE.';

    public function __construct(
        protected ProductionBackupService $backupService
    ) {
        parent::__construct();
    }

    /**
     * Exécuter la commande.
     */
    public function handle(): int
    {
        $backupId = $this->argument('backup_id');
        $useLatest = (bool) $this->option('latest');

        $this->printHeader();

        if (empty($backupId) && ! $useLatest) {
            $backups = $this->backupService->listBackups();

            if (empty($backups)) {
                $this->error('  Aucune sauvegarde locale disponible à vérifier.');

                return self::FAILURE;
            }

            $choices = array_column($backups, 'id');
            $backupId = $this->choice(
                '  Sélectionnez la sauvegarde à auditer :',
                $choices,
                0
            );
        } elseif ($useLatest || empty($backupId)) {
            $backups = $this->backupService->listBackups();

            if (empty($backups)) {
                $this->error('  Aucune sauvegarde locale trouvée.');

                return self::FAILURE;
            }

            $backupId = $backups[0]['id'];
        }

        $cleanId = basename($backupId, '.zip');
        $this->line("  Audit de l'archive : <fg=cyan;options=bold>{$cleanId}.zip</>");
        $this->line('');

        $report = $this->backupService->verifyBackup($cleanId);

        $this->printVerificationDetails($report);

        return $report['valid'] ? self::SUCCESS : self::FAILURE;
    }

    /**
     * Afficher l'en-tête de la commande.
     */
    private function printHeader(): void
    {
        $this->line('');
        $this->line('  <fg=yellow;options=bold>╔════════════════════════════════════════════╗</>');
        $this->line('  <fg=yellow;options=bold>║      HAFROSE — Audit Intégrité Backup      ║</>');
        $this->line('  <fg=yellow;options=bold>╚════════════════════════════════════════════╝</>');
        $this->line('');
    }

    /**
     * Afficher le tableau détaillé des vérifications.
     */
    private function printVerificationDetails(array $report): void
    {
        $headers = ['Contrôle d\'intégrité', 'Statut', 'Détail'];
        $rows = [];

        $checkIcon = fn ($ok) => $ok ? '<fg=green>✓ VALIDE</>' : '<fg=red>✗ ÉCHEC</>';

        $rows[] = [
            'Fichier archive',
            $checkIcon(! empty($report['archive_sha256'])),
            $report['archive_size_human'].' (SHA-256: '.($report['archive_sha256'] ? substr($report['archive_sha256'], 0, 16).'…' : 'N/A').')',
        ];

        $rows[] = [
            'Structure ZIP (CRC/Deflate)',
            $checkIcon($report['zip_integrity']),
            $report['zip_integrity'] ? 'Archive décompressable sans corruption' : 'Fichier corrompu ou non ZIP',
        ];

        $rows[] = [
            'Manifeste JSON',
            $checkIcon($report['manifest_present'] && $report['manifest_valid']),
            $report['manifest_present']
                ? ($report['manifest_valid'] ? 'manifest.json conforme (v'.$report['manifest']['manifest_version'].')' : 'JSON invalide')
                : 'manifest.json absent',
        ];

        $rows[] = [
            'Hachages SHA-256 des fichiers',
            $checkIcon($report['checksums_verified']),
            $report['checksums_verified']
                ? 'Tous les hachages internes sont conformes'
                : 'Discordance ou fichiers manquants détectés',
        ];

        $rows[] = [
            'Dump base de données',
            $checkIcon($report['database_valid']),
            $report['database_valid']
                ? 'Tables et requêtes SQL structurelles présentes'
                : 'Dump absent ou vide',
        ];

        $this->table($headers, $rows);

        // Affichage des métadonnées du manifest si présent
        if (! empty($report['manifest'])) {
            $m = $report['manifest'];
            $this->line('');
            $this->line('  <options=bold>Métadonnées du manifest :</>');
            $this->line("    • Date & heure : {$m['created_at']}");
            $this->line("    • Version App  : {$m['app_version']}");
            $this->line("    • Commit Git   : ".($m['git_commit'] ?? 'N/A'));
            $this->line("    • Moteur DB    : {$m['database']['engine']} (Base: {$m['database']['name']}, Tables: {$m['database']['tables_count']})");
            $this->line("    • Fichiers     : {$m['total_files_count']} indexés");
        }

        if (! empty($report['warnings'])) {
            $this->line('');
            $this->warn('  Avertissements :');
            foreach ($report['warnings'] as $warning) {
                $this->line("    ⚠️  {$warning}");
            }
        }

        if (! empty($report['errors'])) {
            $this->line('');
            $this->line('  <fg=red;options=bold>Erreurs détectées :</>');
            foreach ($report['errors'] as $error) {
                $this->line("    ✗  {$error}");
            }
        }

        $this->line('');
        if ($report['valid']) {
            $this->line('  <fg=green;options=bold>✓ La sauvegarde est 100% VALIDE et prête pour restauration.</>');
        } else {
            $this->line('  <fg=red;options=bold>✗ La sauvegarde est INVALIDE ou corrompue.</>');
        }
        $this->line('');
    }
}
