<?php

namespace App\Services;

use App\Models\AdminLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Service d'agrégation et de consultation de l'historique des modifications par ressource.
 */
class ResourceHistoryService
{
    /**
     * Obtenir l'historique des modifications paginé pour une ressource et un identifiant donnés.
     */
    public function getResourceHistory(string $resource, int $resourceId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $normalizedResource = $this->normalizeResourceName($resource);

        $query = AdminLog::query()
            ->with('admin')
            ->where(function ($q) use ($normalizedResource) {
                $q->where('resource', $normalizedResource)
                    ->orWhere('resource', Str::singular($normalizedResource))
                    ->orWhere('resource', Str::plural($normalizedResource));
            })
            ->where(function ($q) use ($resourceId) {
                $q->where('resource_id', $resourceId)
                    ->orWhereJsonContains('old_values->ids', $resourceId)
                    ->orWhereJsonContains('new_values->modified_ids', $resourceId);
            });

        // Recherche textuelle dans la description ou les détails
        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', $search)
                    ->orWhere('action', 'like', $search)
                    ->orWhere('ip_address', 'like', $search);
            });
        }

        // Filtre par type d'action
        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        // Filtres par plage de dates
        if (! empty($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Normaliser le nom de la ressource vers le nom singulier en minuscules.
     */
    protected function normalizeResourceName(string $resource): string
    {
        $res = strtolower(trim($resource));

        return match ($res) {
            'products', 'product' => AdminLog::RESOURCE_PRODUCT,
            'categories', 'category' => AdminLog::RESOURCE_CATEGORY,
            'orders', 'order' => AdminLog::RESOURCE_ORDER,
            'reviews', 'review' => AdminLog::RESOURCE_REVIEW,
            'contacts', 'contact' => AdminLog::RESOURCE_CONTACT,
            'users', 'user' => AdminLog::RESOURCE_USER,
            'settings', 'setting' => AdminLog::RESOURCE_SETTING,
            'media' => AdminLog::RESOURCE_MEDIA,
            default => $res,
        };
    }
}
