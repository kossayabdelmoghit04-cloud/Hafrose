<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $user = auth('sanctum')->user() ?? $request->user();
        if ($user) {
            $data['user_id'] = $user->id;
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
    public function myOrders(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::with('orderItems.product')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse(OrderResource::collection($orders));
    }

    /**
     * GET /api/auth/orders/{id}
     * Obtenir les détails d'une commande du client connecté.
     * La Policy OrderPolicy::view() vérifie que l'utilisateur est bien le
     * propriétaire : prévient l'IDOR (User A ne peut pas accéder commande User B).
     */
    public function myOrderDetails(Request $request, int $id): JsonResponse
    {
        $order = Order::with('orderItems.product')->findOrFail($id);

        $this->authorize('view', $order);

        return $this->successResponse(new OrderResource($order));
    }
}
