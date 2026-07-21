<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use App\Services\TurnstileService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * VerifyTurnstileToken
 *
 * Middleware centralisé de vérification Cloudflare Turnstile.
 *
 * Comportement :
 * - Lit le token dans le champ `cf-turnstile-response` de la requête.
 * - Délègue la vérification au TurnstileService (aucune logique réseau ici).
 * - Transmet l'IP et la route complète au service pour un logging riche.
 * - Retourne une réponse JSON 422 cohérente avec le reste de l'API en cas d'échec.
 * - Si TURNSTILE_ENABLED=false (tests, CI), le service accepte tout token.
 *
 * Ordre recommandé dans les routes :
 *   ->middleware(['throttle:contact', 'honeypot', 'turnstile'])
 *   Le honeypot est exécuté avant Turnstile : si un bot est détecté par le honeypot,
 *   aucun appel réseau vers Cloudflare n'est effectué.
 *
 * Usage dans routes/api.php :
 *   ->middleware('turnstile')
 *
 * @see App\Services\TurnstileService
 * @see config/turnstile.php
 */
class VerifyTurnstileToken
{
    public function __construct(
        protected TurnstileService $turnstile,
        protected ActivityLogService $activityLogService,
    ) {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->input('cf-turnstile-response');
        $ip    = $request->ip();
        $route = $request->fullUrl();

        if (! $this->turnstile->verify($token, $ip, $route)) {
            $this->logFailure($ip, $route, empty($token));

            return response()->json([
                'success' => false,
                'message' => 'Vérification CAPTCHA invalide ou expirée.',
                'errors'  => [
                    'cf-turnstile-response' => [
                        'La vérification CAPTCHA a échoué. Veuillez actualiser la page et réessayer.',
                    ],
                ],
                'data' => null,
            ], 422);
        }

        return $next($request);
    }

    /**
     * Enregistrer un warning lors d'un échec de vérification CAPTCHA
     * et l'inscrire dans le journal d'activité global.
     *
     * @param  string|null  $ip          Adresse IP du client.
     * @param  string       $route       URL complète appelée.
     * @param  bool         $tokenEmpty  Indique si le token était absent (vs invalide).
     */
    private function logFailure(?string $ip, string $route, bool $tokenEmpty): void
    {
        $reason = $tokenEmpty ? 'token absent' : 'token invalide ou rejeté';

        Log::channel(config('turnstile.log_channel', 'stack'))
            ->warning('[Turnstile] Vérification CAPTCHA échouée.', [
                'reason'    => $reason,
                'ip'        => $ip,
                'route'     => $route,
                'timestamp' => now()->toDateTimeString(),
            ]);

        // Journalisation dans le journal d'activité global (catégorie sécurité)
        $this->activityLogService->log(
            eventType: ActivityLog::EVENT_TURNSTILE_FAILED,
            category:  ActivityLog::CATEGORY_SECURITY,
            resource:  parse_url($route, PHP_URL_PATH) ?? $route,
            metadata:  [
                'reason' => $reason,
                'route'  => $route,
            ]
        );
    }
}
