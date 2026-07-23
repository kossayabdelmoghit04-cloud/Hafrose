<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ActivityLogIndexRequest;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

/**
 * Contrôleur de consultation du journal d'activité global.
 *
 * Ce journal est en lecture seule : aucune mutation (création / mise à jour / suppression)
 * n'est exposée via l'API. L'immutabilité est une exigence de sécurité et d'audit.
 */
class ActivityLogController extends Controller
{
    use HttpResponses;

    /**
     * Obtenir la liste paginée et filtrable du journal d'activité global.
     */
    public function index(ActivityLogIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = ActivityLog::with(['user:id,name,email,role'])
            ->latest();

        // ── Filtrage par catégorie ────────────────────────────────────────────
        if (! empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        // ── Filtrage par type d'événement ────────────────────────────────────
        if (! empty($validated['event_type'])) {
            $query->where('event_type', 'like', '%'.trim($validated['event_type']).'%');
        }

        // ── Filtrage par utilisateur ─────────────────────────────────────────
        if (! empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        // ── Filtrage par ressource ───────────────────────────────────────────
        if (! empty($validated['resource'])) {
            $query->where('resource', $validated['resource']);
        }

        // ── Filtrage par plage de dates ──────────────────────────────────────
        if (! empty($validated['date_from'])) {
            $query->where('created_at', '>=', $validated['date_from'].' 00:00:00');
        }
        if (! empty($validated['date_to'])) {
            $query->where('created_at', '<=', $validated['date_to'].' 23:59:59');
        }

        // ── Recherche textuelle ──────────────────────────────────────────────
        if (! empty($validated['search'])) {
            $term = '%'.trim($validated['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('event_type', 'like', $term)
                    ->orWhere('category', 'like', $term)
                    ->orWhere('resource', 'like', $term)
                    ->orWhere('ip_address', 'like', $term)
                    ->orWhereHas('user', function ($u) use ($term) {
                        $u->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
            });
        }

        // ── Tri personnalisé ─────────────────────────────────────────────────
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($validated['sort_order'] ?? 'desc');
        $query->reorder($sortBy, $sortOrder);

        // ── Pagination ───────────────────────────────────────────────────────
        $perPage = (int) ($validated['per_page'] ?? 20);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors' => null,
            'data' => ActivityLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Obtenir le détail d'une entrée du journal d'activité.
     */
    public function show(int $id): JsonResponse
    {
        $log = ActivityLog::with(['user:id,name,email,role'])->find($id);

        if (! $log) {
            return $this->errorResponse("Entrée du journal d'activité introuvable.", 404);
        }

        return $this->successResponse(new ActivityLogResource($log));
    }
}
