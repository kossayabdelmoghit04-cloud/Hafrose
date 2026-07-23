<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\AdminLog;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service centralisé pour l'exécution sécurisée et transactionnelle d'actions groupées (Bulk Actions).
 */
class BulkActionService
{
    public function __construct(
        protected AdminLogService $adminLogService,
        protected ActivityLogService $activityLogService,
    ) {}

    /**
     * Exécuter une action groupée sur une liste d'identifiants de ressources.
     *
     * @param  Request  $request  La requête HTTP courante pour les informations de traçabilité.
     * @param  string  $resource  Type de ressource ('products', 'categories', 'reviews', 'contacts', 'orders').
     * @param  string  $action  Nom de l'action ('delete', 'activate', 'deactivate', 'publish', 'unpublish', 'approve', 'reject', 'mark_read', 'status_update', 'archive').
     * @param  array  $ids  Liste des identifiants numériques.
     * @param  array  $params  Paramètres supplémentaires (ex: 'status' pour status_update).
     * @return array Rapport d'exécution [action, resource, count_modified, count_ignored, errors].
     */
    public function executeBulkAction(Request $request, string $resource, string $action, array $ids, array $params = []): array
    {
        $normalizedResource = strtolower(trim($resource));
        $normalizedAction = strtolower(trim($action));

        $countModified = 0;
        $countIgnored = 0;
        $errors = [];
        $modifiedIds = [];

        DB::transaction(function () use (
            $request,
            $normalizedResource,
            $normalizedAction,
            $ids,
            $params,
            &$countModified,
            &$countIgnored,
            &$errors,
            &$modifiedIds
        ) {
            foreach ($ids as $id) {
                try {
                    $result = $this->applySingleAction($normalizedResource, $normalizedAction, (int) $id, $params);
                    if ($result['success']) {
                        $countModified++;
                        $modifiedIds[] = (int) $id;
                    } else {
                        $countIgnored++;
                        if (! empty($result['error'])) {
                            $errors[] = "ID {$id}: ".$result['error'];
                        }
                    }
                } catch (\Throwable $e) {
                    $countIgnored++;
                    $errors[] = "ID {$id}: ".$e->getMessage();
                    Log::error("BulkAction error for {$normalizedResource} #{$id}: ".$e->getMessage());
                }
            }

            // Si au moins un élément a été modifié, enregistrer les logs
            if ($countModified > 0) {
                $resourceName = match ($normalizedResource) {
                    'products', 'product' => AdminLog::RESOURCE_PRODUCT,
                    'categories', 'category' => AdminLog::RESOURCE_CATEGORY,
                    'orders', 'order' => AdminLog::RESOURCE_ORDER,
                    'reviews', 'review' => AdminLog::RESOURCE_REVIEW,
                    'contacts', 'contact' => AdminLog::RESOURCE_CONTACT,
                    default => $normalizedResource,
                };

                $adminAction = match ($normalizedAction) {
                    'delete' => AdminLog::ACTION_BULK_DELETE,
                    'activate' => AdminLog::ACTION_ACTIVATE,
                    'deactivate' => AdminLog::ACTION_DEACTIVATE,
                    'publish' => AdminLog::ACTION_PUBLISH,
                    'unpublish' => AdminLog::ACTION_UNPUBLISH,
                    'approve' => AdminLog::ACTION_APPROVE,
                    'reject' => AdminLog::ACTION_REJECT,
                    'mark_read', 'mark_unread' => AdminLog::ACTION_MARK_READ,
                    'status_update' => AdminLog::ACTION_STATUS_CHANGE,
                    'archive' => AdminLog::ACTION_ARCHIVE,
                    default => AdminLog::ACTION_BULK_UPDATE,
                };

                $description = sprintf(
                    "Action groupée '%s' exécutée sur %d élément(s) de type %s (IDs: %s).",
                    $normalizedAction,
                    $countModified,
                    $normalizedResource,
                    implode(', ', $modifiedIds)
                );

                $this->adminLogService->log(
                    request: $request,
                    action: $adminAction,
                    resource: $resourceName,
                    resourceId: null,
                    oldValues: ['ids' => $ids],
                    newValues: ['action' => $normalizedAction, 'modified_ids' => $modifiedIds, 'params' => $params],
                    description: $description
                );

                $this->activityLogService->log(
                    eventType: 'admin.bulk_action',
                    category: ActivityLog::CATEGORY_ADMIN,
                    resource: $resourceName,
                    resourceId: null,
                    metadata: [
                        'action' => $normalizedAction,
                        'count_modified' => $countModified,
                        'modified_ids' => $modifiedIds,
                    ]
                );
            }
        });

        return [
            'action' => $normalizedAction,
            'resource' => $normalizedResource,
            'count_modified' => $countModified,
            'count_ignored' => $countIgnored,
            'errors' => $errors,
        ];
    }

    /**
     * Appliquer l'action sur une ressource unique.
     */
    protected function applySingleAction(string $resource, string $action, int $id, array $params = []): array
    {
        return match ($resource) {
            'products', 'product' => $this->handleProductAction($action, $id, $params),
            'categories', 'category' => $this->handleCategoryAction($action, $id, $params),
            'orders', 'order' => $this->handleOrderAction($action, $id, $params),
            'reviews', 'review' => $this->handleReviewAction($action, $id, $params),
            'contacts', 'contact' => $this->handleContactAction($action, $id, $params),
            default => ['success' => false, 'error' => 'Ressource non reconnue.'],
        };
    }

    protected function handleProductAction(string $action, int $id, array $params): array
    {
        $product = Product::find($id);
        if (! $product) {
            return ['success' => false, 'error' => 'Produit introuvable.'];
        }

        switch ($action) {
            case 'delete':
                $product->delete();

                return ['success' => true];

            case 'activate':
            case 'publish':
                $product->update(['is_featured' => true]);

                return ['success' => true];

            case 'deactivate':
            case 'unpublish':
                $product->update(['is_featured' => false]);

                return ['success' => true];

            default:
                return ['success' => false, 'error' => "Action '{$action}' non supportée pour les produits."];
        }
    }

    protected function handleCategoryAction(string $action, int $id, array $params): array
    {
        $category = Category::find($id);
        if (! $category) {
            return ['success' => false, 'error' => 'Catégorie introuvable.'];
        }

        switch ($action) {
            case 'delete':
                // Empêcher la suppression si des produits y sont rattachés
                if ($category->products()->count() > 0) {
                    return ['success' => false, 'error' => 'Impossible de supprimer une catégorie contenant des produits.'];
                }
                $category->delete();

                return ['success' => true];

            default:
                return ['success' => false, 'error' => "Action '{$action}' non supportée pour les catégories."];
        }
    }

    protected function handleOrderAction(string $action, int $id, array $params): array
    {
        $order = Order::find($id);
        if (! $order) {
            return ['success' => false, 'error' => 'Commande introuvable.'];
        }

        switch ($action) {
            case 'delete':
                $order->delete();

                return ['success' => true];

            case 'archive':
                $order->update(['status' => Order::STATUS_CANCELLED]);

                return ['success' => true];

            case 'status_update':
                $newStatus = $params['status'] ?? null;
                if (! $newStatus) {
                    return ['success' => false, 'error' => 'Le statut cible est obligatoire.'];
                }
                $order->update(['status' => $newStatus]);

                return ['success' => true];

            default:
                return ['success' => false, 'error' => "Action '{$action}' non supportée pour les commandes."];
        }
    }

    protected function handleReviewAction(string $action, int $id, array $params): array
    {
        $review = Review::find($id);
        if (! $review) {
            return ['success' => false, 'error' => 'Avis introuvable.'];
        }

        switch ($action) {
            case 'delete':
                $review->delete();

                return ['success' => true];

            case 'approve':
                $review->update(['is_approved' => true]);

                return ['success' => true];

            case 'reject':
                $review->update(['is_approved' => false]);

                return ['success' => true];

            default:
                return ['success' => false, 'error' => "Action '{$action}' non supportée pour les avis."];
        }
    }

    protected function handleContactAction(string $action, int $id, array $params): array
    {
        $contact = Contact::find($id);
        if (! $contact) {
            return ['success' => false, 'error' => 'Contact introuvable.'];
        }

        switch ($action) {
            case 'delete':
                $contact->delete();

                return ['success' => true];

            case 'mark_read':
                $contact->update(['is_read' => true]);

                return ['success' => true];

            case 'mark_unread':
                $contact->update(['is_read' => false]);

                return ['success' => true];

            default:
                return ['success' => false, 'error' => "Action '{$action}' non supportée pour les contacts."];
        }
    }
}
