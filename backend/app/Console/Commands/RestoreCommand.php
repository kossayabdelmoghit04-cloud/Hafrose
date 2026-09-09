<?php

namespace App\Console\Commands;

use App\Services\ProductionBackupService;
use Illuminate\Console\Command;

/**
 * Commande Artisan : hafrose:restore
 *
 * Restaure une sauvegarde HAFROSE locale (base de données, storage, images).
 *
 * Options :
 *   --target-db= : Spécifier une base MySQL cible (ex: hafrose_restore_test)
 *   --no-db      : Ignorer la restauration de la base
 *   --no-storage : Ignorer la restauration des fichiers storage
 *   --no-images  : Ignorer la restauration des images publiques
 *   --force      : Ignorer la demande de confirmation
 *   --dry-run    : Simuler la restauration sans écrire
 *
 * Usage :
 *   php artisan hafrose:restore
 *   php artisan hafrose:restore hafrose-backup_2026-09-09_12-00-00
 *   php artisan hafrose:restore --target-db=hafrose_restore_test --force
 *   php artisan hafrose:restore --dry-run
 */
class RestoreCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:restore
        {backup_id? : Identifiant de la sauvegarde (nom sans .zip)}
        {--target-db= : Base de données cible (par défaut: base configurée dans .env)}
        {--no-db : Ne pas restaurer la base de données}
        {--no-storage : Ne pas restaurer le stockage storage/app}
        {--no-images : Ne pas restaurer les images publiques}
        {--force : Forcer l\'exécution sans confirmation interactive}
        {--dry-run : Simuler la restauration sans appliquer les modifications}';

    /**
     * Description de la commande.
     */
    protected $description = 'Restaurer une sauvegarde locale HAFROSE (base de données, storage, images).';

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
        $targetDb = $this->option('target-db');
        $restoreDb = ! $this->option('no-db');
        $restoreStorage = ! $this->option('no-storage');
        $restoreImages = ! $this->option('no-images');
        $force = (bool) $this->option('force');
        $dryRun = (bool) $this->option('dry-run');

        $this->printHeader($dryRun);

        // Si aucun ID spécifié, proposer les sauvegardes disponibles
        if (empty($backupId)) {
            $backups = $this->backupService->listBackups();

            if (empty($backups)) {
                $this->error('  Aucune sauvegarde locale disponible dans storage/app/backups.');

                return self::FAILURE;
            }

            $choices = array_column($backups, 'id');
            $backupId = $this->choice(
                '  Sélectionnez la sauvegarde à restaurer :',
                $choices,
                0
            );
        }

        $cleanId = basename($backupId, '.zip');
        $destinationDb = $targetDb ?: config('database.connections.mysql.database', 'hafrose');

        $this->line("  Sauvegarde sélectionnée : <fg=cyan;options=bold>{$cleanId}</>");
        $this->line("  Base de données cible   : <fg=yellow;options=bold>{$destinationDb}</>");
        $this->line('  Composants à restaurer  : '
            .($restoreDb ? '<fg=green>[DB]</> ' : '<fg=gray>[--no-db]</> ')
            .($restoreStorage ? '<fg=green>[Storage]</> ' : '<fg=gray>[--no-storage]</> ')
            .($restoreImages ? '<fg=green>[Images]</>' : '<fg=gray>[--no-images]</>')
        );

        // Confirmation interactive sauf si --force ou --dry-run
        if (! $force && ! $dryRun) {
            $this->line('');
            $this->warn("  ⚠️  ATTENTION : La restauration écrasera les données actuelles de la base `{$destinationDb}`.");
            if (! $this->confirm('  Voulez-vous vraiment poursuivre la restauration ?', false)) {
                $this->line('');
                $this->info('  Opération annulée par l\'utilisateur.');

                return self::SUCCESS;
            }
        }

        $this->line('');
        $this->line('  Lancement de la restauration...');

        $report = $this->backupService->restore(
            backupId: $cleanId,
            targetDatabase: $targetDb,
            restoreDatabase: $restoreDb,
            restoreStorage: $restoreStorage,
            restoreImages: $restoreImages,
            dryRun: $dryRun,
            verbose: true
        );

        $this->printSteps($report);
        $this->printReport($report, $dryRun);

        return $report['success'] ? self::SUCCESS : self::FAILURE;
    }

    /**
     * Afficher l'en-tête de la commande.
     */
    private function printHeader(bool $dryRun): void
    {
        $this->line('');
        $this->line('  <fg=magenta;options=bold>╔════════════════════════════════════════════╗</>');
        $this->line('  <fg=magenta;options=bold>║        HAFROSE — Restauration Locale       ║</>');
        $this->line('  <fg=magenta;options=bold>╚════════════════════════════════════════════╝</>');

        if ($dryRun) {
            $this->line('');
            $this->warn('  [DRY-RUN] Simulation — aucune donnée ne sera modifiée.');
        }

        $this->line('');
        $this->line('  Démarré le : '.now()->format('Y-m-d H:i:s'));
        $this->line('  Environnement : '.app()->environment());
        $this->line('');
    }

    /**
     * Afficher chaque étape du rapport.
     */
    private function printSteps(array $report): void
    {
        if (empty($report['steps'])) {
            return;
        }

        $this->line('');
        $this->line('  <options=bold>Étapes de restauration :</>');
        $this->line('  '.str_repeat('─', 44));

        $icons = [
            'OK' => '<fg=green>✓</>',
            'FAIL' => '<fg=red>✗</>',
            'SKIP' => '<fg=yellow>⊘</>',
            'DRY-RUN' => '<fg=cyan>◎</>',
        ];

        foreach ($report['steps'] as $step) {
            $icon = $icons[$step['status']] ?? '<fg=gray>?</>';
            $label = str_pad(ucfirst(str_replace('_', ' ', $step['name'])), 16);
            $status = str_pad($step['status'], 8);
            $message = ' — '.$step['message'];

            $this->line("  {$icon} {$label} : <options=bold>{$status}</>{$message}");
        }

        $this->line('  '.str_repeat('─', 44));
    }

    /**
     * Afficher le rapport final.
     */
    private function printReport(array $report, bool $dryRun): void
    {
        $this->line('');

        if (! empty($report['errors'])) {
            $this->line('  <fg=red;options=bold>Erreurs :</>');
            foreach ($report['errors'] as $error) {
                $this->error("    • {$error}");
            }
            $this->line('');
        }

        if ($report['success']) {
            if (isset($report['duration_s'])) {
                $this->line("  Durée : {$report['duration_s']} seconde(s)");
            }

            $this->line('');
            $this->line('  <fg=green;options=bold>✓ Restauration terminée avec succès.</>');
        } else {
            $this->line('');
            $this->line('  <fg=red;options=bold>✗ La restauration a échoué. Consultez les erreurs ci-dessus.</>');
        }

        $this->line('');
    }
}
