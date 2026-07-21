<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminBulkActionRequest;
use App\Services\BulkActionService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class BulkActionController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected BulkActionService $bulkActionService,
    ) {}

    /**
     * Exécuter une action groupée sur une ressource.
     */
    public function bulk(AdminBulkActionRequest $request, string $resource): JsonResponse
    {
        $validated = $request->validated();

        $action = $validated['action'];
        $ids = $validated['ids'];
        $params = $validated['params'] ?? [];

        $result = $this->bulkActionService->executeBulkAction(
            request: $request,
            resource: $resource,
            action: $action,
            ids: $ids,
            params: $params
        );

        $message = sprintf(
            "Action groupée '%s' exécutée : %d élément(s) modifié(s), %d ignoré(s).",
            $action,
            $result['count_modified'],
            $result['count_ignored']
        );

        return response()->json([
            'success' => true,
            'message' => $message,
            'errors' => $result['errors'],
            'data' => $result,
        ]);
    }
}
