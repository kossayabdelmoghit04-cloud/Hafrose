<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * ImageOptimizationService — HAFROSE
 *
 * Responsabilités :
 *  - Redimensionner les images uploadées en variantes adaptées à l'UI
 *  - Comprimer intelligemment (qualité / poids équilibrés)
 *  - Générer des versions WebP parallèles pour chaque variante
 *  - Supprimer l'original et toutes ses variantes proprement
 *
 * Variantes générées :
 *  - card   (480×640)   → ProductCard / CategoryCard
 *  - thumb  (120×160)   → Miniatures galerie / thumbnails
 *  - large  (1200×1200) → Vue détail plein format
 *  - banner (1400×700)  → Bannières éditoriales / hero
 */
class ImageOptimizationService
{
    protected array $sizes;

    protected int $quality;

    protected bool $generateWebp;

    protected int $webpQuality;

    public function __construct()
    {
        $this->sizes = config('cache-performance.images.sizes', [
            'card' => ['width' => 480,  'height' => 640,  'crop' => false],
            'thumb' => ['width' => 120,  'height' => 160,  'crop' => true],
            'large' => ['width' => 1200, 'height' => 1200, 'crop' => false],
            'banner' => ['width' => 1400, 'height' => 700,  'crop' => false],
        ]);
        $this->quality = config('cache-performance.images.quality', 82);
        $this->generateWebp = (bool) config('cache-performance.images.generate_webp', true);
        $this->webpQuality = (int) config('cache-performance.images.webp_quality', 80);
    }

    /**
     * Optimiser une image uploadée et générer ses variantes (+ WebP si activé).
     *
     * @param  UploadedFile|string  $file  Fichier uploadé ou chemin relatif dans le disk
     * @param  string  $disk  Disque de stockage (ex: 'public')
     * @param  string  $directory  Dossier destination (ex: 'products')
     * @param  array  $variants  Noms des variantes à générer (défaut : toutes)
     * @return array {
     *               original: string,
     *               mime_type: string,
     *               variants: array<string, string>,
     *               webp: array<string, string>,
     *               }
     */
    public function optimizeAndStore(
        UploadedFile|string $file,
        string $disk = 'public',
        string $directory = 'media',
        array $variants = []
    ): array {
        if ($file instanceof UploadedFile) {
            $originalPath = $file->store($directory, $disk);
            $mimeType = $file->getMimeType();
            $fullOriginalPath = Storage::disk($disk)->path($originalPath);
        } else {
            $originalPath = $file;
            $fullOriginalPath = Storage::disk($disk)->path($originalPath);
            $mimeType = file_exists($fullOriginalPath)
                ? (mime_content_type($fullOriginalPath) ?: 'image/jpeg')
                : 'image/jpeg';
        }

        $result = [
            'original' => $originalPath,
            'mime_type' => $mimeType,
            'variants' => [],
            'webp' => [],
        ];

        if (! extension_loaded('gd') || ! file_exists($fullOriginalPath)) {
            Log::warning("GD extension not available or file missing; optimization skipped for {$originalPath}");

            return $result;
        }

        $imageResource = $this->createGdResource($fullOriginalPath, $mimeType);
        if (! $imageResource) {
            Log::warning("Could not create GD resource for {$originalPath} (mime: {$mimeType})");

            return $result;
        }

        $pathInfo = pathinfo($originalPath);
        $dirname = ($pathInfo['dirname'] !== '.') ? $pathInfo['dirname'] : $directory;
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? 'jpg');

        // Sélectionner les variantes à générer
        $sizesToGenerate = empty($variants)
            ? $this->sizes
            : array_intersect_key($this->sizes, array_flip($variants));

        foreach ($sizesToGenerate as $variantName => $dimensions) {
            try {
                $resized = $this->resizeImage(
                    $imageResource,
                    $dimensions['width'],
                    $dimensions['height'],
                    $dimensions['crop'] ?? false
                );

                if (! $resized) {
                    continue;
                }

                // Assurer l'existence du répertoire
                $variantFilename = "{$dirname}/{$filename}_{$variantName}.{$ext}";
                $fullVariantPath = Storage::disk($disk)->path($variantFilename);
                $this->ensureDirectory($fullVariantPath);

                // Sauvegarder la variante dans le format original
                $this->saveGdResource($resized, $fullVariantPath, $mimeType, $this->quality);
                $result['variants'][$variantName] = $variantFilename;

                // Générer la version WebP si activé et si la source n'est pas déjà WebP/SVG
                if ($this->generateWebp && $this->canConvertToWebp($mimeType)) {
                    $webpFilename = "{$dirname}/{$filename}_{$variantName}.webp";
                    $fullWebpPath = Storage::disk($disk)->path($webpFilename);
                    $this->ensureDirectory($fullWebpPath);

                    if (@imagewebp($resized, $fullWebpPath, $this->webpQuality)) {
                        $result['webp'][$variantName] = $webpFilename;
                    }
                }

                imagedestroy($resized);
            } catch (\Throwable $e) {
                Log::error("Failed to generate image variant '{$variantName}' for {$originalPath}: ".$e->getMessage());
            }
        }

        imagedestroy($imageResource);

        return $result;
    }

    /**
     * Supprimer un fichier original et toutes ses variantes (JPEG + WebP + suffixes legacy).
     */
    public function deleteWithVariants(string $originalPath, string $disk = 'public'): bool
    {
        $pathInfo = pathinfo($originalPath);
        $dirname = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? '');

        // Supprimer l'original
        if (Storage::disk($disk)->exists($originalPath)) {
            Storage::disk($disk)->delete($originalPath);
        }

        // Tous les suffixes possibles (nouveaux et legacy)
        $allSuffixes = array_unique(array_merge(
            array_keys($this->sizes),
            ['thumbnail', 'medium', 'large', 'thumb', 'card', 'banner']
        ));

        // Supprimer chaque variante
        foreach ($allSuffixes as $suffix) {
            $variantPath = "{$dirname}/{$filename}_{$suffix}.{$ext}";
            if (Storage::disk($disk)->exists($variantPath)) {
                Storage::disk($disk)->delete($variantPath);
            }

            $webpPath = "{$dirname}/{$filename}_{$suffix}.webp";
            if (Storage::disk($disk)->exists($webpPath)) {
                Storage::disk($disk)->delete($webpPath);
            }
        }

        return true;
    }

    /**
     * Obtenir les chemins théoriques de toutes les déclinaisons configurées pour un fichier donné.
     * Méthode de compatibilité rétroactive.
     */
    public function getVariantPaths(string $originalPath): array
    {
        $pathInfo = pathinfo($originalPath);
        $dirname = ($pathInfo['dirname'] !== '.') ? $pathInfo['dirname'] : '';
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? 'jpg');

        $variants = [];
        foreach ($this->sizes as $variantName => $dims) {
            $variants[$variantName] = ($dirname ? "{$dirname}/" : '')."{$filename}_{$variantName}.{$ext}";
        }

        return $variants;
    }

    /**
     * Obtenir les chemins de toutes les variantes existant réellement sur le disque pour un fichier donné.
     */
    public function getExistingVariantPaths(string $originalPath, string $disk = 'public'): array
    {
        $pathInfo = pathinfo($originalPath);
        $dirname = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? '');

        $variants = [];
        $webp = [];

        foreach ($this->sizes as $variantName => $dims) {
            $variantPath = "{$dirname}/{$filename}_{$variantName}.{$ext}";
            if (Storage::disk($disk)->exists($variantPath)) {
                $variants[$variantName] = $variantPath;
            }

            $webpPath = "{$dirname}/{$filename}_{$variantName}.webp";
            if (Storage::disk($disk)->exists($webpPath)) {
                $webp[$variantName] = $webpPath;
            }
        }

        return ['variants' => $variants, 'webp' => $webp];
    }

    /**
     * Obtenir le chemin de la variante WebP pour un chemin original et un nom de variante.
     */
    public function getWebpPath(string $originalPath, string $variantName): string
    {
        $pathInfo = pathinfo($originalPath);
        $dirname = ($pathInfo['dirname'] !== '.') ? $pathInfo['dirname'] : '';
        $filename = $pathInfo['filename'];

        return ($dirname ? "{$dirname}/" : '')."{$filename}_{$variantName}.webp";
    }

    /**
     * Obtenir l'URL publique d'une variante si elle existe sur le disque.
     *
     * @return string|null URL complète ou null si la variante n'existe pas
     */
    public function getVariantUrl(string $originalPath, string $variantName, string $disk = 'public'): ?string
    {
        $pathInfo = pathinfo($originalPath);
        $dirname = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? '');

        $variantPath = "{$dirname}/{$filename}_{$variantName}.{$ext}";

        if (Storage::disk($disk)->exists($variantPath)) {
            return Storage::disk($disk)->url($variantPath);
        }

        return null;
    }

    /**
     * Obtenir l'URL publique de la variante WebP si elle existe.
     *
     * @return string|null URL complète ou null si le WebP n'existe pas
     */
    public function getVariantWebpUrl(string $originalPath, string $variantName, string $disk = 'public'): ?string
    {
        $webpPath = $this->getWebpPath($originalPath, $variantName);

        // Normaliser si le dirname est '.'
        $webpPath = ltrim(str_replace('/./', '/', '/'.$webpPath), '/');

        // Recherche à la racine si dirname était '.'
        $pathInfo = pathinfo($originalPath);
        $dirname = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

        $candidate = "{$dirname}/{$filename}_{$variantName}.webp";

        if (Storage::disk($disk)->exists($candidate)) {
            return Storage::disk($disk)->url($candidate);
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Méthodes protégées — Manipulation GD
    // -------------------------------------------------------------------------

    protected function createGdResource(string $filePath, string $mimeType): mixed
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($filePath),
            'image/png' => @imagecreatefrompng($filePath),
            'image/webp' => @imagecreatefromwebp($filePath),
            'image/gif' => @imagecreatefromgif($filePath),
            default => null,
        };
    }

    protected function saveGdResource(mixed $resource, string $outputPath, string $mimeType, int $quality): bool
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => imagejpeg($resource, $outputPath, $quality),
            'image/png' => imagepng($resource, $outputPath, (int) round((9 * (100 - $quality)) / 100)),
            'image/webp' => imagewebp($resource, $outputPath, $quality),
            'image/gif' => imagegif($resource, $outputPath),
            default => false,
        };
    }

    protected function resizeImage(mixed $source, int $targetWidth, int $targetHeight, bool $crop = false): mixed
    {
        $origWidth = imagesx($source);
        $origHeight = imagesy($source);

        if ($origWidth <= 0 || $origHeight <= 0) {
            return null;
        }

        if ($crop) {
            $ratio = max($targetWidth / $origWidth, $targetHeight / $origHeight);
            $newWidth = (int) round($origWidth * $ratio);
            $newHeight = (int) round($origHeight * $ratio);

            $srcX = (int) round(($newWidth - $targetWidth) / (2 * $ratio));
            $srcY = (int) round(($newHeight - $targetHeight) / (2 * $ratio));

            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
            $this->preserveAlpha($source, $canvas);

            imagecopyresampled(
                $canvas, $source,
                0, 0, $srcX, $srcY,
                $targetWidth, $targetHeight,
                (int) round($targetWidth / $ratio),
                (int) round($targetHeight / $ratio)
            );

            return $canvas;
        }

        // Redimensionnement proportionnel (pas d'agrandissement)
        $ratio = min($targetWidth / $origWidth, $targetHeight / $origHeight);

        if ($ratio >= 1.0) {
            // L'image est déjà plus petite que la cible : pas d'agrandissement
            $targetWidth = $origWidth;
            $targetHeight = $origHeight;
        } else {
            $targetWidth = (int) round($origWidth * $ratio);
            $targetHeight = (int) round($origHeight * $ratio);
        }

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        $this->preserveAlpha($source, $canvas);

        imagecopyresampled(
            $canvas, $source,
            0, 0, 0, 0,
            $targetWidth, $targetHeight,
            $origWidth, $origHeight
        );

        return $canvas;
    }

    protected function preserveAlpha(mixed $source, mixed $canvas): void
    {
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
        imagefilledrectangle($canvas, 0, 0, imagesx($canvas), imagesy($canvas), $transparent);
    }

    protected function canConvertToWebp(string $mimeType): bool
    {
        return in_array($mimeType, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'], true);
    }

    protected function ensureDirectory(string $fullPath): void
    {
        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}
