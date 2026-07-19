<?php

namespace App\Services;

use App\Models\User;
use App\Models\WishlistItem;
use App\Models\ActivityLog;
use App\Repositories\Contracts\WishlistRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class WishlistService
{
    protected WishlistRepositoryInterface $wishlistRepository;
    protected ProductRepositoryInterface $productRepository;
    protected ActivityLogService $activityLogService;

    public function __construct(
        WishlistRepositoryInterface $wishlistRepository,
        ProductRepositoryInterface $productRepository,
        ActivityLogService $activityLogService
    ) {
        $this->wishlistRepository = $wishlistRepository;
        $this->productRepository = $productRepository;
        $this->activityLogService = $activityLogService;
    }

    /**
     * Récupérer tous les favoris de l'utilisateur connecté.
     */
    public function getUserWishlist(User $user): Collection
    {
        return $this->wishlistRepository->getFavoritesForUser($user);
    }

    /**
     * Ajouter un produit à la wishlist de l'utilisateur.
     */
    public function addProductToWishlist(User $user, int $productId): WishlistItem
    {
        // Optionnel : vérifier si le produit existe
        $product = $this->productRepository->find($productId);
        if (!$product) {
            throw new ModelNotFoundException("Product not found");
        }

        // Si le produit est déjà présent, on le retourne directement pour éviter un doublon logique
        $existing = $this->wishlistRepository->findForUserAndProduct($user, $productId);
        if ($existing) {
            return $existing;
        }

        $wishlistItem = $this->wishlistRepository->createForUser($user, $productId);

        // Enregistrer l'activité d'ajout aux favoris
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_WISHLIST_ADDED,
            category:   ActivityLog::CATEGORY_WISHLIST,
            resource:   'products',
            resourceId: $productId,
            metadata:   ['product_name' => $product->name],
            userId:     $user->id
        );

        return $wishlistItem;
    }

    /**
     * Retirer un produit de la wishlist.
     */
    public function removeProductFromWishlist(User $user, int $productId): bool
    {
        $wishlistItem = $this->wishlistRepository->findForUserAndProduct($user, $productId);
        
        if (!$wishlistItem) {
            throw new ModelNotFoundException("Wishlist item not found");
        }

        // Charger la relation product si nécessaire pour l'activité log (évite le lazy loading)
        $wishlistItem->loadMissing('product');
        $productName = $wishlistItem->product?->name;

        $deleted = $this->wishlistRepository->delete($wishlistItem);

        if ($deleted) {
            // Enregistrer l'activité de retrait des favoris
            $this->activityLogService->log(
                eventType:  ActivityLog::EVENT_WISHLIST_REMOVED,
                category:   ActivityLog::CATEGORY_WISHLIST,
                resource:   'products',
                resourceId: $productId,
                metadata:   $productName ? ['product_name' => $productName] : null,
                userId:     $user->id
            );
        }

        return $deleted;
    }

    /**
     * Vérifier si un produit est dans la wishlist de l'utilisateur.
     *
     * Utilise exists() pour éviter de charger l'objet entier en mémoire.
     */
    public function isFavorite(User $user, int $productId): bool
    {
        return $this->wishlistRepository->existsForUserAndProduct($user, $productId);
    }
}
