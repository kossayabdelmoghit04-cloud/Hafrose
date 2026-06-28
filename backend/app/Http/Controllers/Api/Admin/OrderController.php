<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
     * Obtenir la liste paginée des commandes avec filtres.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'date']);
        $perPage = (int) $request->input('per_page', 10);

        $orders = $this->orderService->getPaginatedOrders($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors'  => null,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    /**
     * Afficher le détail d'une commande.
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);
        return $this->successResponse(new OrderResource($order));
    }

    /**
     * Mettre à jour le statut d'une commande.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:' . implode(',', [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_SHIPPED,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED,
            ]),
        ]);

        $order = $this->orderService->getOrderById($id);
        $updated = $this->orderService->updateOrderStatus($order, $request->input('status'));

        return $this->successResponse(
            new OrderResource($updated),
            'Statut de la commande mis à jour.'
        );
    }

    /**
     * Exporter une commande au format PDF (facture).
     */
    public function exportPdf(int $id): \Illuminate\Http\Response
    {
        $order = $this->orderService->getOrderById($id);

        $html = view('pdf.invoice', ['order' => $order])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("facture-commande-{$order->id}.pdf");
    }
}
