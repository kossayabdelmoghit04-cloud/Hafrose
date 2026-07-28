<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Webhook;
use App\Services\WebhookService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    use HttpResponses;

    protected WebhookService $webhookService;

    public function __construct(WebhookService $webhookService)
    {
        $this->webhookService = $webhookService;
    }

    public function index(): JsonResponse
    {
        return $this->successResponse(Webhook::all());
    }

    public function store(Request $request): JsonResponse
    {
        $name = $request->input('name', 'Nouveau Webhook');
        $url = $request->input('url', 'https://example.com/webhook');
        $events = $request->input('events', ['order.created']);

        $webhook = $this->webhookService->registerWebhook($name, $url, $events);

        return $this->successResponse($webhook, 'Webhook enregistré.', 201);
    }
}
