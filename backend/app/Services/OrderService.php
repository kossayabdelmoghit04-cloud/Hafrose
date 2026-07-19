<?php

namespace App\Services;

use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Models\Order;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\HttpResponseException;

class OrderService
{
    protected OrderRepositoryInterface $orderRepository;
    protected ProductRepositoryInterface $productRepository;
    protected ActivityLogService $activityLogService;

    public function __construct(
        OrderRepositoryInterface $orderRepository,
        ProductRepositoryInterface $productRepository,
        ActivityLogService $activityLogService
    ) {
        $this->orderRepository = $orderRepository;
        $this->productRepository = $productRepository;
        $this->activityLogService = $activityLogService;
    }

    /**
     * Créer une commande dans une transaction sécurisée.
     */
    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            // 1. Créer la commande initiale
            $order = $this->orderRepository->create([
                'customer_name' => $data['customer'],
                'phone'         => $data['phone'],
                'address'       => $data['address'],
                'city'          => $data['city'],
                'total_price'   => 0.00,
                'status'        => Order::STATUS_PENDING,
            ]);

            // 2. Traiter chaque article de commande
            foreach ($data['items'] as $item) {
                // Verrou pessimiste (lockForUpdate) sur le produit
                $product = $this->productRepository->findForUpdate($item['product_id']);

                if (!$product) {
                    throw new HttpResponseException(response()->json([
                        'success' => false,
                        'message' => 'Product not found',
                        'errors'  => ['product_id' => ["Le produit avec l'ID {$item['product_id']} n'existe pas."]],
                        'data'    => null,
                    ], 404));
                }

                if ($product->stock < $item['quantity']) {
                    throw new HttpResponseException(response()->json([
                        'success' => false,
                        'message' => "Le stock est insuffisant pour le produit : {$product->name}",
                        'errors'  => ['stock' => ["Le stock disponible est de {$product->stock} unité(s)."]],
                        'data'    => null,
                    ], 409));
                }

                // Décrémenter le stock
                $product->decrement('stock', $item['quantity']);

                // Créer la ligne de commande (le sous-total et le total de la commande se mettent à jour automatiquement via Eloquent)
                $this->orderRepository->createItem($order, [
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $product->price,
                ]);
            }

            // Recharger la commande pour obtenir le total_price mis à jour par Eloquent
            $order->refresh();

            // Enregistrer l'activité de création de commande
            $this->activityLogService->log(
                eventType:  ActivityLog::EVENT_ORDER_CREATED,
                category:   ActivityLog::CATEGORY_ORDER,
                resource:   'orders',
                resourceId: $order->id,
                metadata:   [
                    'customer'    => $order->customer_name,
                    'total_price' => $order->total_price,
                    'city'        => $order->city,
                ]
            );

            // Charger les lignes de commande et les produits pour le formatage
            return $order->load('orderItems.product');
        });
    }

    /**
     * Obtenir les commandes paginées pour l'administration.
     */
    public function getPaginatedOrders(array $filters, int $perPage = 10): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->orderRepository->paginateWithFilters($filters, $perPage);
    }

    /**
     * Obtenir une commande par son ID.
     */
    public function getOrderById(int $id): Order
    {
        $order = $this->orderRepository->find($id);

        if (!$order) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Order not found");
        }

        return $order;
    }

    /**
     * Mettre à jour le statut d'une commande. Gère la restitution du stock en cas d'annulation.
     */
    public function updateOrderStatus(Order $order, string $status): Order
    {
        return DB::transaction(function () use ($order, $status) {
            $oldStatus = $order->status;

            if ($status === $oldStatus) {
                return $order;
            }

            // Si la commande est annulée, restituer le stock
            if ($status === Order::STATUS_CANCELLED && $oldStatus !== Order::STATUS_CANCELLED) {
                // Charger les articles si non déjà en mémoire pour éviter le lazy loading implicite
                $order->loadMissing('orderItems');
                foreach ($order->orderItems as $item) {
                    $product = $this->productRepository->findForUpdate($item->product_id);
                    if ($product) {
                        $product->increment('stock', $item->quantity);
                    }
                }
            }
            // Si la commande était annulée et qu'elle est réactivée, décrémenter le stock si possible
            elseif ($oldStatus === Order::STATUS_CANCELLED && $status !== Order::STATUS_CANCELLED) {
                // Charger les articles si non déjà en mémoire pour éviter le lazy loading implicite
                $order->loadMissing('orderItems');
                foreach ($order->orderItems as $item) {
                    $product = $this->productRepository->findForUpdate($item->product_id);
                    if ($product) {
                        if ($product->stock < $item->quantity) {
                            throw new HttpResponseException(response()->json([
                                'success' => false,
                                'message' => "Le stock est insuffisant pour réactiver la commande (produit : {$product->name})",
                                'errors'  => ['stock' => ["Le stock actuel est de {$product->stock}."]],
                                'data'    => null,
                            ], 409));
                        }
                        $product->decrement('stock', $item->quantity);
                    }
                }
            }

            $updatedOrder = $this->orderRepository->update($order, ['status' => $status]);

            // Enregistrer l'activité de changement de statut de la commande
            $this->activityLogService->log(
                eventType:  ActivityLog::EVENT_ORDER_STATUS_CHANGED,
                category:   ActivityLog::CATEGORY_ORDER,
                resource:   'orders',
                resourceId: $updatedOrder->id,
                metadata:   [
                    'old_status' => $oldStatus,
                    'new_status' => $status,
                ]
            );

            return $updatedOrder;
        });
    }
}
