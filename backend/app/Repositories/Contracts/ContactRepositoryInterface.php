<?php

namespace App\Repositories\Contracts;

use App\Models\Contact;

interface ContactRepositoryInterface
{
    /**
     * Créer un nouveau message de contact.
     */
    public function create(array $data): Contact;

    /**
     * Obtenir tous les messages de contact (avec pagination et recherche).
     */
    public function paginate(array $filters, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator;

    /**
     * Trouver un message de contact par son ID.
     */
    public function find(int $id): ?Contact;

    /**
     * Mettre à jour un message de contact (ex: marquer comme lu).
     */
    public function update(Contact $contact, array $data): Contact;

    /**
     * Supprimer un message de contact.
     */
    public function delete(Contact $contact): bool;
}
