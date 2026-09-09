<?php

namespace App\Console\Commands;

use App\Services\ProductionBackupService;
use Illuminate\Console\Command;

/**
 * Commande Artisan : hafrose:backup:list
 *
 * Liste les sauvegardes locales disponibles dans storage/app/backups.
 *
 * Usage :
 *   php artisan hafrose:backup:list
 */
class ListBackupsCommand extends Command
{
    /**
     * Signature de la commande.
     */
    protected $signature = 'hafrose:backup:list';

    /**
     * Description de la commande.
     */
    protected $description = 'Lister toutes les sauvegardes locales disponibles avec leur taille et date.';

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
        $this->line('');
        $this->line('  <fg=cyan;options=bold>╔════════════════════════════════════════════╗</>');
        $this->line('  <fg=cyan;options=bold>║       HAFROSE — Sauvegardes Locales        ║</>');
        $this->line('  <fg=cyan;options=bold>╚════════════════════════════════════════════╝</>');
        $this->line('');

        $backups = $this->backupService->listBackups();

        if (empty($backups)) {
            $this->warn('  Aucune sauvegarde trouvée dans le répertoire local.');
            $this->line('  Pour créer votre première sauvegarde, exécutez :');
            $this->line('  <fg=yellow>php artisan hafrose:backup --detailed</>');
            $this->line('');

            return self::SUCCESS;
        }

        $headers = ['Identifiant', 'Nom de fichier', 'Taille', 'Date de création'];
        $rows = [];

        foreach ($backups as $b) {
            $rows[] = [
                $b['id'],
                $b['filename'],
                $b['size_human'],
                $b['created_at'],
            ];
        }

        $this->table($headers, $rows);

        $totalCount = count($backups);
        $totalSizeMb = round(array_sum(array_column($backups, 'size_kb')) / 1024, 2);

        $this->line("  Total : <options=bold>{$totalCount}</> sauvegarde(s) ({$totalSizeMb} Mo)");
        $this->line('');
        $this->line('  Pour restaurer une sauvegarde :');
        $this->line('  <fg=yellow>php artisan hafrose:restore <id></>');
        $this->line('  Pour vérifier son intégrité :');
        $this->line('  <fg=yellow>php artisan hafrose:backup:verify <id></>');
        $this->line('');

        return self::SUCCESS;
    }
}
