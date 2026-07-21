<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminHistoryRequest;
use App\Http\Resources\HistoryResource;
use App\Services\ResourceHistoryService;
use Illuminate\Http\JsonResponse;

class HistoryController extends Controller
{
    public function __construct(
        protected ResourceHistoryService $historyService,
    ) {}

    /**
     * Obtenir l'historique des modifications d'une ressource spécifique.
     */
    public function show(AdminHistoryRequest $request, string $resource, int $id): JsonResponse
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);

        $history = $this->historyService->getResourceHistory($resource, $id, $validated, $perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors' => null,
            'data' => HistoryResource::collection($history),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'per_page' => $history->perPage(),
                'total' => $history->total(),
            ],
        ]);
    }
}
