<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Resources\ContactResource;
use App\Services\ContactService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    use HttpResponses;

    protected ContactService $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * Envoyer un message de contact (sécurisé par le validateur et le rate-limiting).
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $contact = $this->contactService->createContactMessage($request->validated());

        return $this->successResponse(
            new ContactResource($contact),
            'Message de contact envoyé avec succès.',
            201
        );
    }
}
