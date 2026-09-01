<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserAddress;

/**
 * UserAddressPolicy — Règles d'autorisation pour la ressource UserAddress.
 *
 * Toutes les opérations sur une adresse sont réservées à son propriétaire.
 * IDOR prévenu : Un client ne peut pas lire, modifier, supprimer ou définir
 * par défaut l'adresse d'un autre client en changeant l'ID dans l'URL.
 */
class UserAddressPolicy
{
    /**
     * Tout utilisateur authentifié peut lister ses propres adresses.
     * (Le contrôleur filtre par user_id — la Policy formalise l'intention.)
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * L'accès à une adresse est réservé à son propriétaire.
     */
    public function view(User $user, UserAddress $address): bool
    {
        return $user->id === $address->user_id;
    }

    /**
     * La modification d'une adresse est réservée à son propriétaire.
     */
    public function update(User $user, UserAddress $address): bool
    {
        return $user->id === $address->user_id;
    }

    /**
     * La suppression d'une adresse est réservée à son propriétaire.
     */
    public function delete(User $user, UserAddress $address): bool
    {
        return $user->id === $address->user_id;
    }

    /**
     * Définir une adresse par défaut est réservé à son propriétaire.
     */
    public function setDefault(User $user, UserAddress $address): bool
    {
        return $user->id === $address->user_id;
    }
}
