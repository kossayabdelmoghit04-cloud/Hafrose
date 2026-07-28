<?php

/**
 * HAFROSE PHP SDK v2.0
 * Client léger pour intégrations côté serveur, webhooks et partenaires.
 */

namespace App\Sdk;

class HafroseSdk
{
    private string $apiBase;
    private ?string $apiToken;

    public function __construct(string $apiBase = 'http://localhost', ?string $apiToken = null)
    {
        $this->apiBase = rtrim($apiBase, '/');
        $this->apiToken = $apiToken;
    }

    private function request(string $method, string $path, array $data = []): array
    {
        $url = $this->apiBase . '/api' . $path;
        $options = [
            'http' => [
                'method' => strtoupper($method),
                'header' => implode("\r\n", array_filter([
                    'Content-Type: application/json',
                    'Accept: application/json',
                    $this->apiToken ? 'Authorization: Bearer ' . $this->apiToken : null,
                ])),
                'content' => !empty($data) ? json_encode($data) : null,
                'ignore_errors' => true,
            ],
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        return json_decode($result ?: '{}', true) ?? [];
    }

    // --- Products ---

    public function getProducts(array $params = []): array
    {
        $qs = http_build_query($params);
        return $this->request('GET', "/products?{$qs}");
    }

    public function getProduct(string $slug): array
    {
        return $this->request('GET', "/products/{$slug}");
    }

    // --- Recommendations ---

    public function getRecommendationsForYou(): array
    {
        return $this->request('GET', '/recommendations/for-you');
    }

    // --- Currencies ---

    public function getCurrencies(): array
    {
        return $this->request('GET', '/currencies');
    }

    // --- Gift Cards ---

    public function checkGiftCard(string $code): array
    {
        return $this->request('GET', "/gift-cards/check?code={$code}");
    }

    // --- Mobile Config ---

    public function getMobileConfig(): array
    {
        return $this->request('GET', '/mobile/config');
    }

    // --- Webhooks (Admin) ---

    public function registerWebhook(string $name, string $url, array $events): array
    {
        return $this->request('POST', '/admin/webhooks', compact('name', 'url', 'events'));
    }
}
