<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    use HttpResponses;

    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Passer une commande (traitement transactionnel et sécurisé).
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        }

        $order = $this->orderService->createOrder($data);

        return $this->successResponse(
            new OrderResource($order),
            'Commande créée avec succès.',
            201
        );
    }

    /**
     * GET /api/auth/orders
     * Obtenir l'historique des commandes du client connecté.
     */
    public function myOrders(\Illuminate\Http\Request $request): JsonResponse
    {
        $orders = \App\Models\Order::with('orderItems.product')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse(OrderResource::collection($orders));
    }

    /**
     * GET /api/auth/orders/{id}
     * Obtenir les détails d'une commande du client connecté.
     */
    public function myOrderDetails(\Illuminate\Http\Request $request, int $id): JsonResponse
    {
        $order = \App\Models\Order::with('orderItems.product')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return $this->successResponse(new OrderResource($order));
    }
}
