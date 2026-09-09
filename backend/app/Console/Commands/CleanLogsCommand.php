<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Commande Artisan : hafrose:logs:clean
 *
 * Nettoyage et purge maîtrisée des logs locaux selon une politique de rétention explicite.
 * Ne supprime jamais aveuglément les fichiers actifs ni les fichiers de configuration (.gitignore).
 *
 * Usage :
 *   php artisan hafrose:logs:clean
 *   php artisan hafrose:logs:clean --days=7
 *   php artisan hafrose:logs:clean --dry-run
 */
class CleanLogsCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:logs:clean
        {--days=14 : Nombre de jours de rétention des logs à conserver}
        {--dry-run : Simuler le nettoyage sans supprimer de fichier}
        {--force : Exécuter sans demander de confirmation}';

    /**
     * Description de la commande.
     */
    protected $description = 'Purger les fichiers de logs locaux obsolètes selon la politique de rétention.';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $isDryRun = (bool) $this->option('dry-run');
        $isForce = (bool) $this->option('force');

        $this->printHeader();

        $logsPath = storage_path('logs');
        if (! File::isDirectory($logsPath)) {
            $this->warn("  Le dossier de logs {$logsPath} n'existe pas.");

            return self::SUCCESS;
        }

        $cutoffTimestamp = now()->subDays($days)->endOfDay()->timestamp;
        $files = File::files($logsPath);

        $toDelete = [];
        $toKeep = [];
        $protectedFiles = ['.gitignore'];

        foreach ($files as $file) {
            $filename = $file->getFilename();

            if (in_array($filename, $protectedFiles, true)) {
                continue;
            }

            // Vérifier la date par le nom de fichier (ex: laravel-2026-08-15.log)
            $fileTime = null;
            if (preg_match('/laravel-(\d{4}-\d{2}-\d{2})\.log$/', $filename, $matches)) {
                $dateParsed = strtotime($matches[1]);
                if ($dateParsed !== false) {
                    $fileTime = $dateParsed;
                }
            }

            // Fallback sur le dernier timestamp de modification
            if ($fileTime === null) {
                $fileTime = $file->getMTime();
            }

            $sizeKb = round($file->getSize() / 1024, 2);

            if ($fileTime < $cutoffTimestamp) {
                $toDelete[] = [
                    'file' => $filename,
                    'path' => $file->getRealPath(),
                    'date' => date('Y-m-d H:i:s', $fileTime),
                    'size' => "{$sizeKb} Ko",
                ];
            } else {
                $toKeep[] = [
                    'file' => $filename,
                    'date' => date('Y-m-d H:i:s', $fileTime),
                    'size' => "{$sizeKb} Ko",
                ];
            }
        }

        $this->line("  <fg=gray>Politique de rétention :</> <fg=yellow>{$days} jours</> (antérieurs au ".date('Y-m-d', $cutoffTimestamp).')');
        $this->line('  <fg=gray>Fichiers conservés :</> '.count($toKeep));
        $this->line('  <fg=gray>Fichiers à purger :</> '.count($toDelete));
        $this->line('');

        if (count($toDelete) === 0) {
            $this->info('  ✔ Aucun fichier de log obsolète à purger. Tout est conforme.');

            return self::SUCCESS;
        }

        $this->table(
            ['Fichier', 'Dernière date', 'Taille', 'Action'],
            array_map(fn ($item) => [
                $item['file'],
                $item['date'],
                $item['size'],
                $isDryRun ? '<fg=yellow>SIMULATION (SUPPRIMÉ)</>' : '<fg=red>SUPPRIMÉ</>',
            ], $toDelete)
        );

        $this->line('');

        if ($isDryRun) {
            $this->info('  [DRY-RUN] Simulation terminée. Aucun fichier n\'a été supprimé.');

            return self::SUCCESS;
        }

        if (! $isForce && ! $this->confirm("  Confirmez-vous la suppression définitive de ces ".count($toDelete)." fichier(s) de logs ?", false)) {
            $this->info('  Opération annulée par l\'utilisateur.');

            return self::SUCCESS;
        }

        $deletedCount = 0;
        foreach ($toDelete as $item) {
            if (File::delete($item['path'])) {
                $deletedCount++;
            }
        }

        $this->info("  ✔ Succès : {$deletedCount} fichier(s) de log purgé(s).");

        return self::SUCCESS;
    }

    private function printHeader(): void
    {
        $this->line('');
        $this->line('  <fg=cyan;options=bold>╔══════════════════════════════════════════════════════════╗</>');
        $this->line('  <fg=cyan;options=bold>║         HAFROSE — Nettoyage & Rétention des Logs         ║</>');
        $this->line('  <fg=cyan;options=bold>╚══════════════════════════════════════════════════════════╝</>');
        $this->line('');
    }
}
