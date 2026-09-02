<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CustomerNotificationController — Gestion des notifications client.
 * Toutes les routes protégées par auth:sanctum.
 */
class CustomerNotificationController extends Controller
{
    use HttpResponses;

    /**
     * GET /api/auth/notifications
     * Lister les notifications de l'utilisateur connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = UserNotification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'read' => $n->is_read,
                'date' => $n->created_at?->toISOString(),
            ]);

        return $this->successResponse($notifications);
    }

    /**
     * GET /api/auth/notifications/unread-count
     * Compter les notifications non lues.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = UserNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return $this->successResponse(['count' => $count]);
    }

    /**
     * PATCH /api/auth/notifications/{id}/read
     * Marquer une notification comme lue.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = UserNotification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->update(['is_read' => true]);

        return $this->successResponse(null, 'Notification marquée comme lue.');
    }

    /**
     * PATCH /api/auth/notifications/read-all
     * Marquer toutes les notifications comme lues.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        UserNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->successResponse(null, 'Toutes les notifications ont été lues.');
    }
}
