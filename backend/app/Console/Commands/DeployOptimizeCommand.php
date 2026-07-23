<?php

namespace App\Console\Commands;

use App\Services\DeploymentHealthService;
use App\Services\DeploymentOptimizationService;
use Illuminate\Console\Command;

/**
 * Commande Artisan : hafrose:deploy:optimize
 *
 * Exécute l'optimisation professionnelle du déploiement HAFROSE avec options :
 *   --clear  : Vider l'ensemble des caches avant d'optimiser
 *   --warmup : Préchauffer les caches applicatifs après l'optimisation
 *   --force  : Forcer l'exécution hors environnement de production
 *
 * Usage :
 *   php artisan hafrose:deploy:optimize
 *   php artisan hafrose:deploy:optimize --clear
 *   php artisan hafrose:deploy:optimize --warmup
 *   php artisan hafrose:deploy:optimize --clear --warmup --force
 */
class DeployOptimizeCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:deploy:optimize
        {--clear  : Vider tous les caches applicatifs et compilés avant l\'optimisation}
        {--warmup : Préchauffer l\'ensemble des caches applicatifs}
        {--force  : Forcer l\'optimisation même en environnement hors production}';

    /**
     * Description de la commande.
     */
    protected $description = 'Optimiser les caches et vérifier l\'infrastructure de déploiement HAFROSE en production.';

    public function __construct(
        protected DeploymentOptimizationService $optimizationService,
        protected DeploymentHealthService $healthService,
    ) {
        parent::__construct();
    }

    /**
     * Exécuter la commande.
     */
    public function handle(): int
    {
        $clear = (bool) $this->option('clear');
        $warmup = (bool) $this->option('warmup');
        $force = (bool) $this->option('force');

        $this->printHeader();

        $env = config('app.env', 'production');
        if ($env !== 'production' && ! $force) {
            $this->warn("  [ATTENTION] Environnement actuel : {$env}.");
            $this->line("  Utilisez <fg=yellow>--force</> pour exécuter l'optimisation en environnement de développement ou de test.");
            $this->line('');

            return self::FAILURE;
        }

        // 1. Vidage des caches si --clear
        if ($clear) {
            $this->info('  ⚡ Vidage préalable des caches...');
            $clearResult = $this->optimizationService->clearCaches();

            if ($clearResult['success']) {
                $this->line("  <fg=green>✓</> Caches vidés avec succès ({$clearResult['duration']} ms).");
            } else {
                $this->warn("  <fg=yellow>!</> Le vidage des caches a rencontré un problème : {$clearResult['message']}");
            }
            $this->line('');
        }

        // 2. Optimisation globale
        $this->info('  🚀 Optimisation du déploiement (config, routes, views, events)...');
        $optResult = $this->optimizationService->optimize();

        if ($optResult['success']) {
            $this->line("  <fg=green>✓</> Optimisation globale terminée en {$optResult['duration']} ms.");
        } else {
            $this->error("  <fg=red>✗</> Échec de l'optimisation : {$optResult['message']}");

            return self::FAILURE;
        }

        // 3. Préchauffage si --warmup
        if ($warmup) {
            $this->line('');
            $this->info('  🔥 Préchauffage des caches...');
            $warmupResult = $this->optimizationService->warmupCaches();
            if ($warmupResult['success']) {
                $this->line("  <fg=green>✓</> Préchauffage terminé avec succès ({$warmupResult['duration']} ms).");
            } else {
                $this->warn("  <fg=yellow>!</> Remarque lors du préchauffage : {$warmupResult['message']}");
            }
        }

        // 4. Audit de santé du déploiement
        $this->line('');
        $this->info("  🔍 Audit de l'infrastructure de déploiement :");
        $health = $this->healthService->checkAll();

        $rows = [];
        foreach ($health['checks'] as $key => $check) {
            $statusLabel = match ($check['status']) {
                'ok' => '<fg=green>PASS</>',
                'warning' => '<fg=yellow>WARN</>',
                'error' => '<fg=red>FAIL</>',
                default => $check['status'],
            };

            $rows[] = [
                $key,
                $statusLabel,
                $check['message'],
            ];
        }

        $this->table(['Vérification', 'Statut', 'Détails'], $rows);

        $this->line('');
        if ($health['overall_status'] === 'ok') {
            $this->line('  <fg=green;options=bold>✔ APPLICATION ET INFRASTRUCTURE PRÊTES POUR LA PRODUCTION</>');
        } else {
            $this->line("  <fg=yellow;options=bold>⚠ Statut global : {$health['overall_status']}. Des ajustements sont recommandés.</>");
        }
        $this->line('');

        return self::SUCCESS;
    }

    /**
     * En-tête console.
     */
    private function printHeader(): void
    {
        $this->line('');
        $this->line('  <fg=cyan;options=bold>╔════════════════════════════════════════════╗</>');
        $this->line('  <fg=cyan;options=bold>║     HAFROSE — Déploiement & Optimisation   ║</>');
        $this->line('  <fg=cyan;options=bold>╚════════════════════════════════════════════╝</>');
        $this->line('');
    }
}
