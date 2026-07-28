<?php

namespace App\Services;

use App\Models\Webhook;
use Illuminate\Support\Str;

class WebhookService
{
    public function registerWebhook(string $name, string $url, array $events): Webhook
    {
        return Webhook::create([
            'name' => $name,
            'url' => $url,
            'secret' => 'whsec_' . Str::random(32),
            'events' => $events,
            'is_active' => true,
        ]);
    }

    public function dispatchEvent(string $event, array $payload): void
    {
        $webhooks = Webhook::where('is_active', true)->get();
        foreach ($webhooks as $webhook) {
            if (in_array('*', $webhook->events) || in_array($event, $webhook->events)) {
                // Signature HMAC SHA256 pour la sécurité entreprise
                $signature = hash_hmac('sha256', json_encode($payload), $webhook->secret);
                // Dispatch simulé / logué
            }
        }
    }
}
