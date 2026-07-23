<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * TurnstileService
 *
 * Centralise toute la logique de vérification des tokens Cloudflare Turnstile.
 *
 * Ce service est injecté dans le middleware VerifyTurnstileToken via le conteneur
 * de services Laravel. Aucune logique réseau Turnstile ne doit exister en dehors
 * de cette classe (principe SRP).
 *
 * Comportement :
 * - Si TURNSTILE_ENABLED=false, tout token est accepté (CI/CD, tests).
 * - Si le token est absent ou vide, la requête est refusée sans appel réseau.
 * - Si la clé secrète n'est pas configurée, l'accès est refusé et une erreur est loguée.
 * - En cas d'indisponibilité Cloudflare (réseau, timeout, HTTP 5xx), l'accès est refusé.
 * - Tous les échecs sont tracés avec IP, route, error-codes et timestamp.
 *
 * @see App\Http\Middleware\VerifyTurnstileToken
 * @see config/turnstile.php
 */
class TurnstileService
{
    /**
     * Vérifier un token Cloudflare Turnstile auprès de l'API Cloudflare.
     *
     * @param  string|null  $token  Token cf-turnstile-response transmis par le frontend.
     * @param  string|null  $ip  Adresse IP du client (renforce la vérification côté Cloudflare).
     * @param  string  $route  URL complète de la route appelée (pour le logging).
     * @return bool true si le token est valide, false dans tous les autres cas.
     */
    public function verify(?string $token, ?string $ip = null, string $route = ''): bool
    {
        // Turnstile désactivé (tests CI/CD) : accepter immédiatement.
        if (! config('turnstile.enabled', true)) {
            return true;
        }

        // Token absent ou vide → refus sans appel réseau.
        if (empty($token)) {
            return false;
        }

        $secretKey = config('turnstile.secret_key');

        // Clé secrète manquante : erreur de configuration — refus sécurisé.
        if (empty($secretKey)) {
            $this->logError('TURNSTILE_SECRET_KEY non configurée — vérification impossible.', [
                'ip' => $ip,
                'route' => $route,
            ]);

            return false;
        }

        try {
            $response = Http::timeout(config('turnstile.timeout', 5))
                ->asForm()
                ->post(
                    config('turnstile.verify_url'),
                    $this->buildPayload($secretKey, $token, $ip)
                );

            if ($response->failed()) {
                $this->logWarning('Réponse HTTP non-2xx reçue de Cloudflare.', [
                    'status' => $response->status(),
                    'ip' => $ip,
                    'route' => $route,
                    'timestamp' => now()->toDateTimeString(),
                ]);

                return false;
            }

            return $this->parseCloudflareResponse($response->json(), $ip, $route);

        } catch (ConnectionException $e) {
            // Indisponibilité réseau ou timeout : refus sécurisé.
            $this->logWarning('Impossible de contacter Cloudflare (réseau / timeout).', [
                'error' => $e->getMessage(),
                'ip' => $ip,
                'route' => $route,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return false;

        } catch (\Exception $e) {
            $this->logError('Erreur inattendue lors de la vérification Turnstile.', [
                'error' => $e->getMessage(),
                'ip' => $ip,
                'route' => $route,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return false;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Méthodes privées
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Construire le payload POST pour l'API Cloudflare Turnstile.
     *
     * @param  string  $secretKey  Clé secrète Turnstile.
     * @param  string  $token  Token cf-turnstile-response.
     * @param  string|null  $ip  IP du client (facultatif).
     * @return array<string, string>
     */
    private function buildPayload(string $secretKey, string $token, ?string $ip): array
    {
        $payload = [
            'secret' => $secretKey,
            'response' => $token,
        ];

        if ($ip !== null) {
            $payload['remoteip'] = $ip;
        }

        return $payload;
    }

    /**
     * Analyser la réponse JSON de l'API Cloudflare et logger les échecs.
     *
     * @param  array<string, mixed>  $data  Réponse JSON décodée.
     * @param  string|null  $ip  IP du client (pour le logging).
     * @param  string  $route  Route appelée (pour le logging).
     * @return bool true si `success === true`, false sinon.
     */
    private function parseCloudflareResponse(array $data, ?string $ip, string $route): bool
    {
        if (isset($data['success']) && $data['success'] === true) {
            return true;
        }

        // Extraire les error-codes Cloudflare pour le logging.
        $errorCodes = $data['error-codes'] ?? [];

        $this->logWarning('Token Turnstile invalide ou expiré selon Cloudflare.', [
            'error_codes' => $errorCodes,
            'ip' => $ip,
            'route' => $route,
            'timestamp' => now()->toDateTimeString(),
        ]);

        return false;
    }

    /**
     * Enregistrer un warning dans le canal de log configuré.
     *
     * @param  string  $message  Message de log.
     * @param  array<string, mixed>  $context  Contexte supplémentaire.
     */
    private function logWarning(string $message, array $context = []): void
    {
        Log::channel(config('turnstile.log_channel', 'stack'))
            ->warning("[Turnstile] {$message}", $context);
    }

    /**
     * Enregistrer une erreur dans le canal de log configuré.
     *
     * @param  string  $message  Message de log.
     * @param  array<string, mixed>  $context  Contexte supplémentaire.
     */
    private function logError(string $message, array $context = []): void
    {
        Log::channel(config('turnstile.log_channel', 'stack'))
            ->error("[Turnstile] {$message}", $context);
    }
}
