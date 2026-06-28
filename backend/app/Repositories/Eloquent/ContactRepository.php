<?php

namespace App\Repositories\Eloquent;

use App\Models\Contact;
use App\Repositories\Contracts\ContactRepositoryInterface;

class ContactRepository implements ContactRepositoryInterface
{
    /**
     * Créer un nouveau message de contact.
     */
    public function create(array $data): Contact
    {
        return Contact::create($data);
    }

    /**
     * Obtenir tous les messages de contact (avec pagination et recherche).
     */
    public function paginate(array $filters, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Contact::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_read']) && $filters['is_read'] !== '') {
            $query->where('is_read', (bool)$filters['is_read']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Trouver un message de contact par son ID.
     */
    public function find(int $id): ?Contact
    {
        return Contact::find($id);
    }

    /**
     * Mettre à jour un message de contact.
     */
    public function update(Contact $contact, array $data): Contact
    {
        $contact->update($data);
        return $contact;
    }

    /**
     * Supprimer un message de contact.
     */
    public function delete(Contact $contact): bool
    {
        return $contact->delete();
    }
}
