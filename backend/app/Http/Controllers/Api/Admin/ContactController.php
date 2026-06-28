<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactResource;
use App\Services\ContactService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use HttpResponses;

    protected ContactService $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * Obtenir la liste paginée de tous les messages de contact avec filtres facultatifs.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_read']);
        $perPage = (int) $request->input('per_page', 15);

        $messages = $this->contactService->getPaginatedContacts($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors'  => null,
            'data'    => ContactResource::collection($messages),
            'meta'    => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
                'per_page'     => $messages->perPage(),
                'total'        => $messages->total(),
            ],
        ]);
    }

    /**
     * Marquer un message de contact comme lu.
     */
    public function markAsRead(int $id): JsonResponse
    {
        $contact = $this->contactService->getContactById($id);
        $updated = $this->contactService->markAsRead($contact);

        return $this->successResponse(
            new ContactResource($updated),
            'Message marqué comme lu avec succès.'
        );
    }

    /**
     * Supprimer un message de contact.
     */
    public function destroy(int $id): JsonResponse
    {
        $contact = $this->contactService->getContactById($id);
        $this->contactService->deleteContact($contact);

        return $this->successResponse(null, 'Message de contact supprimé avec succès.');
    }
}
