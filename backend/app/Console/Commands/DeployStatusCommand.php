<?php

namespace App\Console\Commands;

use App\Services\DeploymentHealthService;
use Illuminate\Console\Command;

/**
 * Commande Artisan : hafrose:deploy:status
 *
 * Audit rapide et vérification de santé de l'infrastructure de déploiement HAFROSE.
 * Utilisée par les scripts de déploiement (deploy.sh, health-check.sh) et pipelines CI/CD.
 *
 * Usage :
 *   php artisan hafrose:deploy:status
 *   php artisan hafrose:deploy:status --json
 */
class DeployStatusCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:deploy:status
        {--json : Renvoyer le rapport sous forme de JSON brut}';

    /**
     * Description de la commande.
     */
    protected $description = 'Vérifier l\'état de santé et de conformité du déploiement HAFROSE.';

    public function __construct(
        protected DeploymentHealthService $healthService,
    ) {
        parent::__construct();
    }

    /**
     * Exécuter la commande.
     */
    public function handle(): int
    {
        $health = $this->healthService->checkAll();

        if ($this->option('json')) {
            $this->line(json_encode($health, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return $health['overall_status'] === 'error' ? self::FAILURE : self::SUCCESS;
        }

        $this->printHeader();

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
        $summary = $health['summary'];
        $this->line("  Total : {$summary['total']} | <fg=green>OK : {$summary['ok']}</> | <fg=yellow>Avertissements : {$summary['warning']}</> | <fg=red>Erreurs : {$summary['error']}</>");
        $this->line('');

        if ($health['overall_status'] === 'error') {
            $this->error('  ✗ ÉCHEC : Des erreurs critiques empêchent la conformité de production.');

            return self::FAILURE;
        }

        if ($health['overall_status'] === 'warning') {
            $this->warn('  ⚠ AVERTISSEMENT : L\'application fonctionne mais certains points nécessitent attention.');

            return self::SUCCESS;
        }

        $this->info('  ✔ SUCCÈS : Tous les indicateurs d\'infrastructure sont au vert.');

        return self::SUCCESS;
    }

    /**
     * En-tête console.
     */
    private function printHeader(): void
    {
        $this->line('');
        $this->line('  <fg=cyan;options=bold>╔════════════════════════════════════════════╗</>');
        $this->line('  <fg=cyan;options=bold>║       HAFROSE — Statut de Déploiement      ║</>');
        $this->line('  <fg=cyan;options=bold>╚════════════════════════════════════════════╝</>');
        $this->line('');
    }
}
