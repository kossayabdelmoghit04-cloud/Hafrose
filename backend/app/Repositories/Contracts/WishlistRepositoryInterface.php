<?php

namespace App\Repositories\Contracts;

use App\Models\WishlistItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface WishlistRepositoryInterface
{
    /**
     * Obtenir tous les favoris d'un utilisateur avec les relations chargées (product, category, galleries).
     */
    public function getFavoritesForUser(User $user): Collection;

    /**
     * Trouver un favori pour un utilisateur et un produit donnés.
     */
    public function findForUserAndProduct(User $user, int $productId): ?WishlistItem;

    /**
     * Ajouter un produit aux favoris de l'utilisateur.
     */
    public function createForUser(User $user, int $productId): WishlistItem;

    /**
     * Supprimer un favori.
     */
    public function delete(WishlistItem $wishlistItem): bool;
}
