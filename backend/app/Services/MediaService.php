<?php

namespace App\Services;

use App\Models\Media;
use App\Repositories\Contracts\MediaRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    protected MediaRepositoryInterface $mediaRepository;

    protected ImageOptimizationService $imageOptimizationService;

    public function __construct(
        MediaRepositoryInterface $mediaRepository,
        ImageOptimizationService $imageOptimizationService
    ) {
        $this->mediaRepository = $mediaRepository;
        $this->imageOptimizationService = $imageOptimizationService;
    }

    /**
     * Récupérer la liste paginée des médias.
     */
    public function getPaginatedMedia(int $perPage = 18): LengthAwarePaginator
    {
        return $this->mediaRepository->paginate($perPage);
    }

    /**
     * Uploader une image dans la médiathèque et générer les déclinaisons optimisées.
     */
    public function uploadMedia(UploadedFile $file): Media
    {
        $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();

        // Créer un nom unique nettoyé
        $safeFilename = str_replace(' ', '_', strtolower($filename)).'_'.time().'.'.$extension;

        // Optimiser et stocker les déclinaisons si c'est une image
        $mimeType = $file->getMimeType();
        if (str_starts_with($mimeType, 'image/')) {
            $optimizationResult = $this->imageOptimizationService->optimizeAndStore($file, 'public', 'media');
            $path = $optimizationResult['original'];
        } else {
            $path = $file->storeAs('media', $safeFilename, 'public');
        }

        // Créer l'enregistrement en base de données
        return $this->mediaRepository->create([
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
        ]);
    }

    /**
     * Supprimer un média de la médiathèque et du disque physique (ainsi que ses déclinaisons).
     */
    public function deleteMedia(int $id): bool
    {
        $media = $this->mediaRepository->find($id);

        if (! $media) {
            throw new ModelNotFoundException('Media not found');
        }

        // Supprimer l'original et ses déclinaisons
        if (str_starts_with($media->mime_type ?? '', 'image/')) {
            $this->imageOptimizationService->deleteWithVariants($media->path, 'public');
        } else {
            if (Storage::disk('public')->exists($media->path)) {
                Storage::disk('public')->delete($media->path);
            }
        }

        // Supprimer de la base de données
        return $this->mediaRepository->delete($id);
    }
}
