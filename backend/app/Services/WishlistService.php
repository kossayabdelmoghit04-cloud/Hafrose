<?php

namespace App\Services;

use App\Models\User;
use App\Models\WishlistItem;
use App\Repositories\Contracts\WishlistRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class WishlistService
{
    protected WishlistRepositoryInterface $wishlistRepository;
    protected ProductRepositoryInterface $productRepository;

    public function __construct(
        WishlistRepositoryInterface $wishlistRepository,
        ProductRepositoryInterface $productRepository
    ) {
        $this->wishlistRepository = $wishlistRepository;
        $this->productRepository = $productRepository;
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

        return $this->wishlistRepository->createForUser($user, $productId);
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

        return $this->wishlistRepository->delete($wishlistItem);
    }

    /**
     * Vérifier si un produit est dans la wishlist de l'utilisateur.
     */
    public function isFavorite(User $user, int $productId): bool
    {
        $item = $this->wishlistRepository->findForUserAndProduct($user, $productId);
        return !is_null($item);
    }
}
