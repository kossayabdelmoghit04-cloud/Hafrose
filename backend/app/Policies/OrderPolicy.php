<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

/**
 * OrderPolicy — Règles d'autorisation pour la ressource Order.
 *
 * Seul le propriétaire d'une commande peut la consulter.
 * L'administrateur peut tout consulter via le back-office (routes séparées).
 *
 * IDOR prévenu : GET /api/auth/orders/{id} n'est accessible que si
 * l'utilisateur connecté est bien le propriétaire de la commande.
 */
class OrderPolicy
{
    /**
     * Tout utilisateur authentifié peut accéder à sa liste de commandes.
     * (Filtrée par user_id dans le contrôleur — la Policy confirme l'intention.)
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Un utilisateur ne peut consulter une commande que s'il en est le propriétaire.
     * Prévient l'IDOR : User A ne peut pas accéder à la commande de User B.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id;
    }
}
