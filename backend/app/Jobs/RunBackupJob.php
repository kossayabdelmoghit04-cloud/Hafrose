<?php

namespace App\Jobs;

use App\Services\ProductionBackupService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class RunBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Nombre maximal de tentatives
     */
    public int $tries = 1;

    /**
     * Timeout du job en secondes (10 minutes)
     */
    public int $timeout = 600;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly bool $dryRun = false,
        public readonly bool $verbose = false,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(ProductionBackupService $backupService): void
    {
        Log::info('RunBackupJob: Démarrage de la sauvegarde.', [
            'dry_run' => $this->dryRun,
            'verbose' => $this->verbose,
        ]);

        $report = $backupService->run(
            dryRun: $this->dryRun,
            verbose: $this->verbose
        );

        if (! $report['success']) {
            $errors = implode('; ', $report['errors'] ?? ['Erreur inconnue']);
            Log::error('RunBackupJob: La sauvegarde a échoué.', [
                'errors' => $report['errors'],
            ]);
            $this->fail(new RuntimeException("Échec de la sauvegarde : {$errors}"));
        } else {
            Log::info('RunBackupJob: Sauvegarde terminée avec succès.', [
                'archive' => $report['archive'] ?? null,
                'duration_s' => $report['duration_s'] ?? 0,
            ]);
        }
    }
}
