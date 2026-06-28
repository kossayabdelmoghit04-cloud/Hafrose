<?php

namespace App\Services;

use App\Models\Media;
use App\Repositories\Contracts\MediaRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    protected MediaRepositoryInterface $mediaRepository;

    public function __construct(MediaRepositoryInterface $mediaRepository)
    {
        $this->mediaRepository = $mediaRepository;
    }

    /**
     * Récupérer la liste paginée des médias.
     */
    public function getPaginatedMedia(int $perPage = 18): LengthAwarePaginator
    {
        return $this->mediaRepository->paginate($perPage);
    }

    /**
     * Uploader une image dans la médiathèque.
     */
    public function uploadMedia(UploadedFile $file): Media
    {
        $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        
        // Créer un nom unique nettoyé
        $safeFilename = str_replace(' ', '_', strtolower($filename)) . '_' . time() . '.' . $extension;
        
        // Stocker le fichier sur le disque public
        $path = $file->storeAs('media', $safeFilename, 'public');

        // Créer l'enregistrement en base de données
        return $this->mediaRepository->create([
            'filename'  => $file->getClientOriginalName(),
            'path'      => $path,
            'mime_type' => $file->getMimeType(),
            'size'      => $file->getSize(),
        ]);
    }

    /**
     * Supprimer un média de la médiathèque et du disque physique.
     */
    public function deleteMedia(int $id): bool
    {
        $media = $this->mediaRepository->find($id);

        if (!$media) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Media not found");
        }

        // Supprimer le fichier physique
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        // Supprimer de la base de données
        return $this->mediaRepository->delete($id);
    }
}
