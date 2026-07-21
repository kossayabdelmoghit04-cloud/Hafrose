<?php

namespace App\Console\Commands;

use App\Services\ProductionBackupService;
use Illuminate\Console\Command;

/**
 * Commande Artisan : hafrose:backup
 *
 * Lance une sauvegarde complète HAFROSE avec options :
 *   --dry-run  : simuler sans rien écrire
 *   --verbose  : afficher les détails de chaque étape
 *   --force    : ignorer la vérification d'activation
 *
 * Usage :
 *   php artisan hafrose:backup
 *   php artisan hafrose:backup --dry-run
 *   php artisan hafrose:backup --verbose
 *   php artisan hafrose:backup --force --verbose
 */
class BackupCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:backup
        {--dry-run  : Simuler la sauvegarde sans rien écrire sur le disque}
        {--detailed : Afficher le détail de chaque étape dans le rapport}
        {--force    : Forcer la sauvegarde même si BACKUP_ENABLED=false}';

    /**
     * Description de la commande.
     */
    protected $description = 'Lancer une sauvegarde complète HAFROSE (base de données, storage, images, fichiers critiques).';

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
        $dryRun   = (bool) $this->option('dry-run');
        $detailed = (bool) $this->option('detailed');
        $force    = (bool) $this->option('force');

        $this->printHeader($dryRun);

        // Vérification activation (sauf --force)
        if (!$force && !config('production.backup.enabled', true)) {
            $this->error('  Les sauvegardes sont désactivées (BACKUP_ENABLED=false).');
            $this->line('  Utilisez --force pour forcer la sauvegarde.');
            return self::FAILURE;
        }

        if ($force && !config('production.backup.enabled', true)) {
            $this->warn('  [--force] Sauvegarde forcée malgré BACKUP_ENABLED=false.');
        }

        // Surcharge temporaire de la config si --force
        if ($force) {
            config(['production.backup.enabled' => true]);
        }

        $this->line('');

        // Lancement
        $report = $this->backupService->run(dryRun: $dryRun, verbose: $detailed);

        // Affichage des étapes
        $this->printSteps($report, $detailed);

        // Résultat final
        $this->printReport($report, $dryRun);

        return $report['success'] ? self::SUCCESS : self::FAILURE;
    }

    // ─── Affichage ───────────────────────────────────────────────────────────

    /**
     * Afficher l'en-tête de la commande.
     */
    private function printHeader(bool $dryRun): void
    {
        $this->line('');
        $this->line('  <fg=cyan;options=bold>╔════════════════════════════════════════════╗</>');
        $this->line('  <fg=cyan;options=bold>║         HAFROSE — Backup Complet           ║</>');
        $this->line('  <fg=cyan;options=bold>╚════════════════════════════════════════════╝</>');

        if ($dryRun) {
            $this->line('');
            $this->warn('  [DRY-RUN] Simulation — aucun fichier ne sera créé.');
        }

        $this->line('');
        $this->line('  Démarré le : ' . now()->format('Y-m-d H:i:s'));
        $this->line('  Environnement : ' . app()->environment());
    }

    /**
     * Afficher chaque étape du rapport.
     */
    private function printSteps(array $report, bool $verbose): void
    {
        $this->line('');
        $this->line('  <options=bold>Étapes :</>');
        $this->line('  ' . str_repeat('─', 44));

        $icons = [
            'OK'      => '<fg=green>✓</>',
            'FAIL'    => '<fg=red>✗</>',
            'SKIP'    => '<fg=yellow>⊘</>',
            'DRY-RUN' => '<fg=cyan>◎</>',
        ];

        foreach ($report['steps'] as $step) {
            $icon    = $icons[$step['status']] ?? '<fg=gray>?</>';
            $label   = str_pad(ucfirst(str_replace('_', ' ', $step['name'])), 16);
            $status  = str_pad($step['status'], 8);
            $message = $verbose ? ' — ' . $step['message'] : '';

            $this->line("  {$icon} {$label} : <options=bold>{$status}</>{$message}");
        }

        $this->line('  ' . str_repeat('─', 44));
    }

    /**
     * Afficher le rapport final.
     */
    private function printReport(array $report, bool $dryRun): void
    {
        $this->line('');

        if (!empty($report['errors'])) {
            $this->line('  <fg=red;options=bold>Erreurs :</>');
            foreach ($report['errors'] as $error) {
                $this->error("    • {$error}");
            }
            $this->line('');
        }

        if ($report['success']) {
            if (!$dryRun && !empty($report['archive'])) {
                $this->line('  <fg=green;options=bold>Sauvegarde créée :</> storage/' . $report['archive']);
            }

            if (isset($report['duration_s'])) {
                $this->line("  Durée : {$report['duration_s']} seconde(s)");
            }

            $this->line('');
            $this->line('  <fg=green;options=bold>✓ Sauvegarde terminée avec succès.</>');
        } else {
            $this->line('');
            $this->line('  <fg=red;options=bold>✗ La sauvegarde a échoué. Consultez les erreurs ci-dessus.</>');
        }

        $this->line('');
    }
}
