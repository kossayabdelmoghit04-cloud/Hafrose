<?php

namespace App\Services;

use App\Repositories\Contracts\ContactRepositoryInterface;
use App\Models\Contact;

class ContactService
{
    protected ContactRepositoryInterface $contactRepository;

    public function __construct(ContactRepositoryInterface $contactRepository)
    {
        $this->contactRepository = $contactRepository;
    }

    /**
     * Enregistrer un nouveau message de contact en filtrant le honeypot.
     */
    public function createContactMessage(array $data): Contact
    {
        // Nettoyage anti-spam (honeypot)
        unset($data['website']);

        // Par défaut le message n'est pas lu
        $data['is_read'] = false;

        return $this->contactRepository->create($data);
    }

    /**
     * Récupérer les messages de contact paginés pour l'administration.
     */
    public function getPaginatedContacts(array $filters, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->contactRepository->paginate($filters, $perPage);
    }

    /**
     * Trouver un message de contact par son ID.
     */
    public function getContactById(int $id): Contact
    {
        $contact = $this->contactRepository->find($id);

        if (!$contact) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Contact message not found");
        }

        return $contact;
    }

    /**
     * Marquer un message de contact comme lu.
     */
    public function markAsRead(Contact $contact): Contact
    {
        return $this->contactRepository->update($contact, ['is_read' => true]);
    }

    /**
     * Supprimer un message de contact.
     */
    public function deleteContact(Contact $contact): bool
    {
        return $this->contactRepository->delete($contact);
    }
}
