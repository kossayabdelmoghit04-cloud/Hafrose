<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLogIndexRequest;
use App\Http\Resources\AdminLogResource;
use App\Models\AdminLog;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class AdminLogController extends Controller
{
    use HttpResponses;

    /**
     * Obtenir la liste paginée et filtrable des logs d'administration.
     */
    public function index(AdminLogIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = AdminLog::with(['admin:id,name,email,role']);

        // Filtrage par administrateur
        if (!empty($validated['admin_id'])) {
            $query->where('admin_id', $validated['admin_id']);
        }

        // Filtrage par action
        if (!empty($validated['action'])) {
            $query->where('action', $validated['action']);
        }

        // Filtrage par ressource (ou resource_type)
        $resourceFilter = $validated['resource'] ?? $validated['resource_type'] ?? null;
        if (!empty($resourceFilter)) {
            $query->where('resource', $resourceFilter);
        }

        // Filtrage par plage de dates
        if (!empty($validated['date_from'])) {
            $query->where('created_at', '>=', $validated['date_from'] . ' 00:00:00');
        }
        if (!empty($validated['date_to'])) {
            $query->where('created_at', '<=', $validated['date_to'] . ' 23:59:59');
        }

        // Recherche textuelle (description, action, resource, ip, nom/email admin)
        if (!empty($validated['search'])) {
            $searchTerm = '%' . trim($validated['search']) . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('description', 'like', $searchTerm)
                  ->orWhere('action', 'like', $searchTerm)
                  ->orWhere('resource', 'like', $searchTerm)
                  ->orWhere('ip_address', 'like', $searchTerm)
                  ->orWhereHas('admin', function ($adminQ) use ($searchTerm) {
                      $adminQ->where('name', 'like', $searchTerm)
                             ->orWhere('email', 'like', $searchTerm);
                  });
            });
        }

        // Tri
        $sortBy    = $validated['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($validated['sort_order'] ?? 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = (int) ($validated['per_page'] ?? 15);
        $logs    = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors'  => null,
            'data'    => AdminLogResource::collection($logs),
            'meta'    => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    /**
     * Obtenir le détail d'un log d'administration spécifique.
     */
    public function show(int $id): JsonResponse
    {
        $log = AdminLog::with(['admin:id,name,email,role'])->find($id);

        if (!$log) {
            return $this->errorResponse('Log d\'administration introuvable.', 404);
        }

        return $this->successResponse(new AdminLogResource($log));
    }
}
