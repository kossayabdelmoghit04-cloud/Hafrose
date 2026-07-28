<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiAssistantService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAssistantController extends Controller
{
    use HttpResponses;

    protected AiAssistantService $assistantService;

    public function __construct(AiAssistantService $assistantService)
    {
        $this->assistantService = $assistantService;
    }

    public function chat(Request $request): JsonResponse
    {
        $message = $request->input('message', '');
        $userId = $request->user('sanctum')?->id;

        $response = $this->assistantService->reply($message, $userId);

        return $this->successResponse($response);
    }
}
