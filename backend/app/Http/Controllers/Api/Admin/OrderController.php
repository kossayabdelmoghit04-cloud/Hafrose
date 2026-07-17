<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminOrderIndexRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\OrderService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected OrderService     $orderService,
        protected AdminLogService  $adminLogService,
    ) {}

    /**
     * Obtenir la liste paginée des commandes avec filtres.
     */
    public function index(AdminOrderIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $filters   = array_filter([
            'search' => $validated['search'] ?? null,
            'status' => $validated['status'] ?? null,
            'date'   => $validated['date']   ?? null,
        ], fn ($v) => $v !== null);
        $perPage = (int) ($validated['per_page'] ?? 10);

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
    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        $order     = $this->orderService->getOrderById($id);
        $oldStatus = $order->status;
        $newStatus = $request->validated()['status'];

        $updated = $this->orderService->updateOrderStatus($order, $newStatus);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_STATUS_CHANGE,
            resource:   AdminLog::RESOURCE_ORDER,
            resourceId: $order->id,
            oldValues:  ['status' => $oldStatus],
            newValues:  ['status' => $newStatus],
        );

        return $this->successResponse(
            new OrderResource($updated),
            'Statut de la commande mis à jour.'
        );
    }

    /**
     * Exporter une commande au format PDF (facture).
     */
    public function exportPdf(Request $request, int $id): \Illuminate\Http\Response
    {
        $order = $this->orderService->getOrderById($id);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_EXPORT,
            resource:   AdminLog::RESOURCE_ORDER,
            resourceId: $order->id,
            newValues:  ['format' => 'pdf'],
        );

        $html = view('pdf.invoice', ['order' => $order])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("facture-commande-{$order->id}.pdf");
    }
}
