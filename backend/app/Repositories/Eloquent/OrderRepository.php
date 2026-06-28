<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\Contracts\OrderRepositoryInterface;

class OrderRepository implements OrderRepositoryInterface
{
    /**
     * Créer une nouvelle commande.
     */
    public function create(array $data): Order
    {
        return Order::create($data);
    }

    /**
     * Ajouter un article à une commande.
     */
    public function createItem(Order $order, array $data): OrderItem
    {
        return $order->orderItems()->create($data);
    }

    /**
     * Obtenir les commandes avec pagination et filtres.
     */
    public function paginateWithFilters(array $filters, int $perPage = 10): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Order::query()->with('orderItems.product');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Trouver une commande par son identifiant.
     */
    public function find(int $id): ?Order
    {
        return Order::with('orderItems.product')->find($id);
    }

    /**
     * Mettre à jour une commande.
     */
    public function update(Order $order, array $data): Order
    {
        $order->update($data);
        return $order;
    }
}
