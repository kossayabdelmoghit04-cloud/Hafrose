<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use App\Models\OrderItem;

interface OrderRepositoryInterface
{
    /**
     * Créer une nouvelle commande.
     */
    public function create(array $data): Order;

    /**
     * Ajouter un article à une commande.
     */
    public function createItem(Order $order, array $data): OrderItem;

    /**
     * Obtenir les commandes avec pagination et filtres.
     */
    public function paginateWithFilters(array $filters, int $perPage = 10): \Illuminate\Contracts\Pagination\LengthAwarePaginator;

    /**
     * Trouver une commande par son identifiant.
     */
    public function find(int $id): ?Order;

    /**
     * Mettre à jour une commande (ex: statut).
     */
    public function update(Order $order, array $data): Order;
}
