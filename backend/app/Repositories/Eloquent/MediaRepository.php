<?php

namespace App\Repositories\Eloquent;

use App\Models\Media;
use App\Repositories\Contracts\MediaRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MediaRepository implements MediaRepositoryInterface
{
    /**
     * Obtenir les médias avec pagination.
     */
    public function paginate(int $perPage = 18): LengthAwarePaginator
    {
        return Media::latest()->paginate($perPage);
    }

    /**
     * Trouver un média par son identifiant.
     */
    public function find(int $id): ?Media
    {
        return Media::find($id);
    }

    /**
     * Enregistrer un nouveau média.
     */
    public function create(array $data): Media
    {
        return Media::create($data);
    }

    /**
     * Supprimer un média.
     */
    public function delete(int $id): bool
    {
        $media = $this->find($id);
        if ($media) {
            return $media->delete();
        }
        return false;
    }
}
