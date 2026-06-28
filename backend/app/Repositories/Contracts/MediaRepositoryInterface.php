<?php

namespace App\Repositories\Contracts;

use App\Models\Media;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface MediaRepositoryInterface
{
    /**
     * Obtenir les médias avec pagination.
     */
    public function paginate(int $perPage = 18): LengthAwarePaginator;

    /**
     * Trouver un média par son identifiant.
     */
    public function find(int $id): ?Media;

    /**
     * Enregistrer un nouveau média.
     */
    public function create(array $data): Media;

    /**
     * Supprimer un média.
     */
    public function delete(int $id): bool;
}
