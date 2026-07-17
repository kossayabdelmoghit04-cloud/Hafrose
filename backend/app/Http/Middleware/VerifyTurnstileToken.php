<?php

namespace App\Http\Middleware;

use App\Services\TurnstileService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * VerifyTurnstileToken
 *
 * Middleware centralisé de vérification Cloudflare Turnstile.
 *
 * Comportement :
 * - Lit le token dans le champ `cf-turnstile-response` de la requête.
 * - Délègue la vérification au TurnstileService (aucune logique réseau ici).
 * - Retourne une réponse JSON 422 cohérente avec le reste de l'API en cas d'échec.
 * - Si TURNSTILE_ENABLED=false (tests, CI), le service accepte tout token.
 *
 * Usage dans routes/api.php :
 *   ->middleware('turnstile')
 */
class VerifyTurnstileToken
{
    public function __construct(protected TurnstileService $turnstile)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->input('cf-turnstile-response');

        if (! $this->turnstile->verify($token, $request->ip())) {
            return response()->json([
                'success' => false,
                'message' => 'Vérification CAPTCHA invalide ou expirée.',
                'errors'  => [
                    'cf-turnstile-response' => ['La vérification CAPTCHA a échoué. Veuillez actualiser la page et réessayer.'],
                ],
                'data' => null,
            ], 422);
        }

        return $next($request);
    }
}
