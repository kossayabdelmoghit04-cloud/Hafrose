<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminContactIndexRequest;
use App\Http\Resources\ContactResource;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\ContactService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected ContactService   $contactService,
        protected AdminLogService  $adminLogService,
    ) {}

    /**
     * Obtenir la liste paginée de tous les messages de contact avec filtres facultatifs.
     */
    public function index(AdminContactIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $filters   = array_filter([
            'search'  => $validated['search']  ?? null,
            'is_read' => $validated['is_read'] ?? null,
        ], fn ($v) => $v !== null);

        $perPage  = (int) ($validated['per_page'] ?? 15);
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
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $contact = $this->contactService->getContactById($id);
        $updated = $this->contactService->markAsRead($contact);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_MARK_READ,
            resource:   AdminLog::RESOURCE_CONTACT,
            resourceId: $contact->id,
            oldValues:  ['is_read' => false],
            newValues:  ['is_read' => true],
        );

        return $this->successResponse(
            new ContactResource($updated),
            'Message marqué comme lu avec succès.'
        );
    }

    /**
     * Supprimer un message de contact.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $contact  = $this->contactService->getContactById($id);
        $snapshot = $this->adminLogService->extractModelValues($contact, ['id', 'name', 'email', 'subject']);

        $this->contactService->deleteContact($contact);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_DELETE,
            resource:   AdminLog::RESOURCE_CONTACT,
            resourceId: $id,
            oldValues:  $snapshot,
        );

        return $this->successResponse(null, 'Message de contact supprimé avec succès.');
    }
}
