<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * TurnstileService
 *
 * Centralise la vérification des tokens Cloudflare Turnstile.
 *
 * Ce service est injecté dans le middleware VerifyTurnstileToken.
 * Aucune logique de vérification ne doit exister en dehors de cette classe.
 */
class TurnstileService
{
    /**
     * Vérifier un token Cloudflare Turnstile auprès de l'API Cloudflare.
     *
     * @param  string|null  $token  Le token cf-turnstile-response transmis par le frontend.
     * @param  string|null  $ip     L'adresse IP du client (facultatif, renforce la vérification).
     * @return bool  true si le token est valide, false dans tous les autres cas.
     */
    public function verify(?string $token, ?string $ip = null): bool
    {
        // Si Turnstile est désactivé (ex : tests CI), accepter tous les tokens.
        if (! config('turnstile.enabled', true)) {
            return true;
        }

        // Token absent ou vide → refus immédiat sans appel réseau.
        if (empty($token)) {
            return false;
        }

        $secretKey = config('turnstile.secret_key');

        // Clé secrète manquante : erreur de configuration — refus sécurisé.
        if (empty($secretKey)) {
            Log::error('TurnstileService : TURNSTILE_SECRET_KEY non configurée.');
            return false;
        }

        try {
            $payload = [
                'secret'   => $secretKey,
                'response' => $token,
            ];

            if ($ip !== null) {
                $payload['remoteip'] = $ip;
            }

            $response = Http::timeout(config('turnstile.timeout', 5))
                ->asForm()
                ->post(config('turnstile.verify_url'), $payload);

            if ($response->failed()) {
                Log::warning('TurnstileService : Réponse HTTP non-2xx reçue de Cloudflare.', [
                    'status' => $response->status(),
                ]);
                return false;
            }

            $data = $response->json();

            return isset($data['success']) && $data['success'] === true;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // Indisponibilité réseau ou timeout
            Log::warning('TurnstileService : Impossible de contacter Cloudflare (réseau).', [
                'error' => $e->getMessage(),
            ]);
            // En cas d'indisponibilité de Cloudflare, on refuse la requête
            // pour éviter de désactiver la protection silencieusement.
            return false;
        } catch (\Exception $e) {
            Log::error('TurnstileService : Erreur inattendue lors de la vérification.', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
