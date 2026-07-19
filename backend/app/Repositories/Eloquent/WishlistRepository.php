<?php

namespace App\Repositories\Eloquent;

use App\Models\WishlistItem;
use App\Models\User;
use App\Repositories\Contracts\WishlistRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class WishlistRepository implements WishlistRepositoryInterface
{
    /**
     * Obtenir tous les favoris d'un utilisateur avec les relations chargées.
     */
    public function getFavoritesForUser(User $user): Collection
    {
        return WishlistItem::with(['product.category', 'product.galleries'])
            ->where('user_id', $user->id)
            ->get();
    }

    /**
     * Trouver un favori pour un utilisateur et un produit donnés.
     */
    public function findForUserAndProduct(User $user, int $productId): ?WishlistItem
    {
        return WishlistItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();
    }

    /**
     * Vérifier si un favori existe pour un utilisateur et un produit donnés.
     * Utilise exists() pour éviter de rapatrier l'enregistrement complet.
     */
    public function existsForUserAndProduct(User $user, int $productId): bool
    {
        return WishlistItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->exists();
    }

    /**
     * Ajouter un produit aux favoris de l'utilisateur.
     */
    public function createForUser(User $user, int $productId): WishlistItem
    {
        return WishlistItem::create([
            'user_id'    => $user->id,
            'product_id' => $productId,
        ]);
    }

    /**
     * Supprimer un favori.
     */
    public function delete(WishlistItem $wishlistItem): bool
    {
        return $wishlistItem->delete();
    }
}
