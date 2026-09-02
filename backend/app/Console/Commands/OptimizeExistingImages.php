<?php

namespace App\Console\Commands;

use App\Services\ImageOptimizationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class OptimizeExistingImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:optimize
                            {--dry-run : Simule l\'optimisation sans modifier les fichiers}
                            {--force : Force la re-génération même si les variantes existent déjà}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Génère les variantes optimisées (card, thumb, large, banner + WebP) pour toutes les images existantes';

    public function __construct(
        protected ImageOptimizationService $imageOptimizationService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $force = $this->option('force');

        $this->info('╔══════════════════════════════════════════════════════════╗');
        $this->info('║       HAFROSE — Optimisation des Images Existantes       ║');
        $this->info('╚══════════════════════════════════════════════════════════╝');
        if ($isDryRun) {
            $this->warn('  [MODE SIMULATION] Aucun fichier ne sera écrit.');
        }

        $directories = [
            'categories' => ['card', 'thumb'],
            'products' => ['card', 'thumb', 'large'],
            'products/gallery' => ['thumb', 'large'],
            'hero' => ['banner', 'large'],
            'banners' => ['banner', 'large'],
        ];

        $totalOriginalSize = 0;
        $totalOptimizedSize = 0;
        $totalProcessed = 0;
        $totalVariantsCreated = 0;

        $variantSuffixes = ['_card', '_thumb', '_large', '_banner', '_thumbnail', '_medium'];

        foreach ($directories as $dir => $variantList) {
            $fullDir = Storage::disk('public')->path($dir);
            if (! is_dir($fullDir)) {
                continue;
            }

            $this->newLine();
            $this->line("<fg=cyan;options=bold>📁 Dossier : {$dir}</>");

            $files = glob($fullDir.'/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE);

            foreach ($files as $filePath) {
                $filename = pathinfo($filePath, PATHINFO_FILENAME);
                $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

                // Ignorer les variantes déjà générées
                $isVariant = false;
                foreach ($variantSuffixes as $suffix) {
                    if (str_ends_with($filename, $suffix)) {
                        $isVariant = true;
                        break;
                    }
                }
                if ($isVariant) {
                    continue;
                }

                $relativePath = $dir.'/'.basename($filePath);
                $originalBytes = filesize($filePath);
                $totalOriginalSize += $originalBytes;
                $totalProcessed++;

                $this->line(sprintf('  ▶ <comment>%-50s</comment> (%d KB)', basename($filePath), round($originalBytes / 1024)));

                if (! $isDryRun) {
                    $result = $this->imageOptimizationService->optimizeAndStore(
                        $relativePath,
                        'public',
                        $dir,
                        $variantList
                    );

                    $variantsCount = count($result['variants'] ?? []) + count($result['webp'] ?? []);
                    $totalVariantsCreated += $variantsCount;

                    // Afficher les variantes générées
                    foreach ($result['variants'] as $vName => $vPath) {
                        $vBytes = Storage::disk('public')->exists($vPath) ? Storage::disk('public')->size($vPath) : 0;
                        $totalOptimizedSize += $vBytes;
                        $this->line(sprintf('     ✓ %-10s : %s (%d KB)', $vName, basename($vPath), round($vBytes / 1024)));
                    }

                    foreach ($result['webp'] as $wName => $wPath) {
                        $wBytes = Storage::disk('public')->exists($wPath) ? Storage::disk('public')->size($wPath) : 0;
                        $this->line(sprintf('     ✓ WebP %-5s : %s (%d KB)', $wName, basename($wPath), round($wBytes / 1024)));
                    }
                }
            }
        }

        $this->newLine(2);
        $this->info('╔══════════════════════════════════════════════════════════╗');
        $this->info('║                   RÉSUMÉ DU TRAITEMENT                   ║');
        $this->info('╚══════════════════════════════════════════════════════════╝');
        $this->line(sprintf('  Images originales traitées : <info>%d</info>', $totalProcessed));
        $this->line(sprintf('  Poids original total       : <info>%d KB (~%.2f MB)</info>', round($totalOriginalSize / 1024), $totalOriginalSize / (1024 * 1024)));

        if (! $isDryRun) {
            $this->line(sprintf('  Variantes générées         : <info>%d</info>', $totalVariantsCreated));
            $this->info("\n  ✅ Optimisation terminée avec succès !");
        }

        return Command::SUCCESS;
    }
}
