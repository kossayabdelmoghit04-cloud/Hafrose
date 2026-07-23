<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageOptimizationService
{
    /**
     * Tailles configurées pour les différentes déclinaisons d'images.
     */
    protected array $sizes;

    protected int $quality;

    public function __construct()
    {
        $this->sizes = config('cache-performance.images.sizes', [
            'thumbnail' => ['width' => 150, 'height' => 150, 'crop' => true],
            'medium' => ['width' => 600, 'height' => 600, 'crop' => false],
            'large' => ['width' => 1200, 'height' => 1200, 'crop' => false],
        ]);
        $this->quality = config('cache-performance.images.quality', 85);
    }

    /**
     * Optimiser une image téléversée et générer ses déclinaisons.
     *
     * @param  UploadedFile|string  $file  Fichier uploadé ou chemin d'accès local
     * @param  string  $disk  Disque de stockage (ex: 'public')
     * @param  string  $directory  Dossier destination (ex: 'media')
     * @return array Informations sur l'original et ses déclinaisons
     */
    public function optimizeAndStore(UploadedFile|string $file, string $disk = 'public', string $directory = 'media'): array
    {
        if ($file instanceof UploadedFile) {
            $originalPath = $file->store($directory, $disk);
            $mimeType = $file->getMimeType();
            $fullOriginalPath = Storage::disk($disk)->path($originalPath);
        } else {
            $originalPath = $file;
            $fullOriginalPath = Storage::disk($disk)->path($originalPath);
            $mimeType = mime_content_type($fullOriginalPath);
        }

        $result = [
            'original' => $originalPath,
            'mime_type' => $mimeType,
            'variants' => [],
        ];

        if (! extension_loaded('gd') || ! file_exists($fullOriginalPath)) {
            Log::warning("GD extension not available or file missing; image optimization skipped for {$originalPath}");

            return $result;
        }

        $imageResource = $this->createGdResource($fullOriginalPath, $mimeType);
        if (! $imageResource) {
            return $result;
        }

        $pathInfo = pathinfo($originalPath);
        $dirname = $pathInfo['dirname'] !== '.' ? $pathInfo['dirname'] : $directory;
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? 'jpg');

        foreach ($this->sizes as $variantName => $dimensions) {
            try {
                $targetWidth = $dimensions['width'];
                $targetHeight = $dimensions['height'];
                $crop = $dimensions['crop'] ?? false;

                $resized = $this->resizeImage($imageResource, $targetWidth, $targetHeight, $crop);
                if (! $resized) {
                    continue;
                }

                $variantFilename = "{$dirname}/{$filename}_{$variantName}.{$ext}";
                $fullVariantPath = Storage::disk($disk)->path($variantFilename);

                // Assurer que le répertoire parent existe
                $variantDir = dirname($fullVariantPath);
                if (! is_dir($variantDir)) {
                    mkdir($variantDir, 0755, true);
                }

                $this->saveGdResource($resized, $fullVariantPath, $mimeType, $this->quality);
                imagedestroy($resized);

                $result['variants'][$variantName] = $variantFilename;
            } catch (\Throwable $e) {
                Log::error("Failed to generate image variant {$variantName}: ".$e->getMessage());
            }
        }

        imagedestroy($imageResource);

        return $result;
    }

    /**
     * Supprimer un fichier original et toutes ses déclinaisons associées.
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

        // Supprimer chaque déclinaison
        foreach ($this->sizes as $variantName => $dims) {
            $variantPath = "{$dirname}/{$filename}_{$variantName}.{$ext}";
            if (Storage::disk($disk)->exists($variantPath)) {
                Storage::disk($disk)->delete($variantPath);
            }
        }

        return true;
    }

    /**
     * Obtenir les chemins des déclinaisons pour un fichier donné.
     */
    public function getVariantPaths(string $originalPath): array
    {
        $pathInfo = pathinfo($originalPath);
        $dirname = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];
        $ext = strtolower($pathInfo['extension'] ?? '');

        $variants = [];
        foreach ($this->sizes as $variantName => $dims) {
            $variants[$variantName] = "{$dirname}/{$filename}_{$variantName}.{$ext}";
        }

        return $variants;
    }

    /**
     * Créer une ressource GD d'après le fichier et le type mime.
     */
    protected function createGdResource(string $filePath, string $mimeType): mixed
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($filePath),
            'image/png' => @imagecreatefrompng($filePath),
            'image/webp' => @imagecreatefromwebp($filePath),
            default => null,
        };
    }

    /**
     * Enregistrer une ressource GD selon le type mime.
     */
    protected function saveGdResource(mixed $resource, string $outputPath, string $mimeType, int $quality): bool
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => imagejpeg($resource, $outputPath, $quality),
            'image/png' => imagepng($resource, $outputPath, (int) round((9 * (100 - $quality)) / 100)),
            'image/webp' => imagewebp($resource, $outputPath, $quality),
            default => false,
        };
    }

    /**
     * Redimensionner une ressource GD tout en conservant le ratio ou en rognant (crop).
     */
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
                (int) round($targetWidth / $ratio), (int) round($targetHeight / $ratio)
            );

            return $canvas;
        } else {
            $ratio = min($targetWidth / $origWidth, $targetHeight / $origHeight);
            if ($ratio >= 1.0) {
                // Pas besoin d'agrandir si déjà plus petit que la cible
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
    }

    /**
     * Préserver la transparence alpha pour PNG / WEBP.
     */
    protected function preserveAlpha(mixed $source, mixed $canvas): void
    {
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
        imagefilledrectangle($canvas, 0, 0, imagesx($canvas), imagesy($canvas), $transparent);
    }
}
