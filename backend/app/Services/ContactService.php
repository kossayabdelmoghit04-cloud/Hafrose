<?php

namespace App\Services;

use App\Repositories\Contracts\ContactRepositoryInterface;
use App\Models\Contact;
use App\Models\ActivityLog;

class ContactService
{
    protected ContactRepositoryInterface $contactRepository;
    protected ActivityLogService $activityLogService;

    public function __construct(
        ContactRepositoryInterface $contactRepository,
        ActivityLogService $activityLogService
    ) {
        $this->contactRepository = $contactRepository;
        $this->activityLogService = $activityLogService;
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

        $contact = $this->contactRepository->create($data);

        // Enregistrer l'activité d'envoi du formulaire de contact
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_CONTACT_SENT,
            category:   ActivityLog::CATEGORY_CONTACT,
            resource:   'contacts',
            resourceId: $contact->id,
            metadata:   [
                'name'    => $contact->name,
                'email'   => $contact->email,
                'subject' => $contact->subject,
            ]
        );

        return $contact;
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
        $updatedContact = $this->contactRepository->update($contact, ['is_read' => true]);

        // Enregistrer l'activité de marquage comme lu
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_CONTACT_MARKED_READ,
            category:   ActivityLog::CATEGORY_CONTACT,
            resource:   'contacts',
            resourceId: $updatedContact->id,
            metadata:   [
                'name'    => $updatedContact->name,
                'subject' => $updatedContact->subject,
            ]
        );

        return $updatedContact;
    }

    /**
     * Supprimer un message de contact.
     */
    public function deleteContact(Contact $contact): bool
    {
        $deleted = $this->contactRepository->delete($contact);

        if ($deleted) {
            // Enregistrer l'activité de suppression du message de contact
            $this->activityLogService->log(
                eventType:  ActivityLog::EVENT_CONTACT_DELETED,
                category:   ActivityLog::CATEGORY_CONTACT,
                resource:   'contacts',
                resourceId: $contact->id,
                metadata:   [
                    'name'    => $contact->name,
                    'subject' => $contact->subject,
                ]
            );
        }

        return $deleted;
    }
}
