<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

/**
 * ReviewPolicy — Règles d'autorisation pour la ressource Review.
 *
 * Les avis sont soumis publiquement (sans auth requise côté route).
 * L'administration (approbation, rejet, suppression) est réservée aux admins
 * via les routes /api/admin/reviews/* protégées par le middleware 'admin'.
 *
 * Cette Policy est enregistrée pour la clarté architecturale et les
 * tests de sécurité explicites.
 */
class ReviewPolicy
{
    /**
     * Tout le monde peut lire les avis approuvés (public).
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Tout le monde peut créer un avis (soumission publique, is_approved = false).
     * La route est protégée par throttle + honeypot + turnstile.
     */
    public function create(?User $user): bool
    {
        return true;
    }

    /**
     * Seul un administrateur peut modifier un avis (approve/reject).
     */
    public function update(User $user, Review $review): bool
    {
        return $user->isAdmin();
    }

    /**
     * Seul un administrateur peut supprimer un avis.
     */
    public function delete(User $user, Review $review): bool
    {
        return $user->isAdmin();
    }
}
