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
        $order = $this->orderService->createOrder($request->validated());

        return $this->successResponse(
            new OrderResource($order),
            'Commande créée avec succès.',
            201
        );
    }
}
