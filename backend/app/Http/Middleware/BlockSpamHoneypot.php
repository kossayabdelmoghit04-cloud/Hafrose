<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * BlockSpamHoneypot
 *
 * Middleware de protection anti-bot transparente par champ Honeypot caché.
 *
 * Fonctionnement :
 * - Un champ HTML caché (ex. "website") est inclus dans les formulaires publics.
 * - Les utilisateurs humains ne remplissent jamais ce champ (il est masqué en CSS).
 * - Les robots remplissent automatiquement tous les champs → détection immédiate.
 *
 * Stratégie Shadow Block :
 * - Lorsqu'un bot est détecté, au lieu de retourner une erreur 400 (qui alerterait le bot),
 *   le middleware retourne une réponse 201 factice cohérente avec la route concernée.
 * - Le bot croit que sa soumission a réussi et ne relance pas l'attaque.
 * - Aucune donnée n'est enregistrée en base de données.
 *
 * Logging :
 * - Chaque détection est enregistrée en warning dans les logs Laravel.
 * - IP, User-Agent, route et timestamp sont tracés pour audit.
 *
 * Configuration : config/honeypot.php
 * Variables d'environnement : HONEYPOT_ENABLED, HONEYPOT_FIELD, HONEYPOT_LOG_CHANNEL
 *
 * Usage dans routes/api.php :
 *   ->middleware('honeypot')
 */
class BlockSpamHoneypot
{
    public function __construct(protected ActivityLogService $activityLogService) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('honeypot.enabled', true)) {
            return $next($request);
        }

        $fieldName = config('honeypot.field_name', 'website');

        if ($request->has($fieldName) && ! empty($request->input($fieldName))) {
            $this->logBotDetection($request, $fieldName);

            if (config('honeypot.shadow_block', true)) {
                return $this->buildShadowResponse($request);
            }

            return response()->json([
                'success' => false,
                'message' => config('honeypot.error_message', 'Requête invalide.'),
                'errors' => null,
                'data' => null,
            ], 400);
        }

        return $next($request);
    }

    /**
     * Enregistre un warning dans les logs Laravel et dans le journal d'activité global
     * lors d'une détection de bot.
     *
     * @param  string  $fieldName  Nom du champ honeypot déclenché
     */
    private function logBotDetection(Request $request, string $fieldName): void
    {
        $channel = config('honeypot.log_channel', 'stack');

        Log::channel($channel)->warning('[Honeypot] Bot détecté — soumission bloquée.', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent() ?? 'unknown',
            'route' => $request->fullUrl(),
            'method' => $request->method(),
            'field' => $fieldName,
            'timestamp' => now()->toDateTimeString(),
        ]);

        // Journalisation dans le journal d'activité global (catégorie sécurité)
        $this->activityLogService->log(
            eventType: ActivityLog::EVENT_HONEYPOT_TRIGGERED,
            category: ActivityLog::CATEGORY_SECURITY,
            resource: $request->path(),
            metadata: [
                'method' => $request->method(),
                'route' => $request->fullUrl(),
                'field' => $fieldName,
                'user_agent' => $request->userAgent() ?? 'unknown',
            ]
        );
    }

    /**
     * Construit une réponse 201 factice adaptée à la route appelée.
     *
     * La réponse reflète les données envoyées par le bot sans jamais toucher
     * à la base de données. L'objectif est de ne pas révéler au bot qu'il a été bloqué.
     */
    private function buildShadowResponse(Request $request): Response
    {
        // ── Contact ──────────────────────────────────────────────────────────
        if ($request->is('api/contact*') || $request->is('contact*')) {
            return response()->json([
                'success' => true,
                'message' => 'Message de contact envoyé avec succès.',
                'errors' => null,
                'data' => [
                    'id' => rand(100, 999),
                    'name' => $request->input('name'),
                    'email' => $request->input('email'),
                    'phone' => $request->input('phone'),
                    'subject' => $request->input('subject'),
                    'message' => $request->input('message'),
                    'is_read' => false,
                    'created_at' => now()->format('Y-m-d H:i:s'),
                ],
            ], 201);
        }

        // ── Avis ─────────────────────────────────────────────────────────────
        if ($request->is('api/reviews*') || $request->is('reviews*')) {
            return response()->json([
                'success' => true,
                'message' => "Avis créé avec succès, en attente d'approbation.",
                'errors' => null,
                'data' => [
                    'id' => rand(100, 999),
                    'product_id' => (int) $request->input('product_id'),
                    'customer_name' => $request->input('customer_name') ?? $request->input('revName'),
                    'rating' => (int) ($request->input('rating') ?? $request->input('revRating') ?? 5),
                    'comment' => $request->input('comment') ?? $request->input('revComment'),
                    'is_approved' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ], 201);
        }

        // ── Commandes ─────────────────────────────────────────────────────────
        if ($request->is('api/orders*') || $request->is('orders*')) {
            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès.',
                'errors' => null,
                'data' => [
                    'id' => rand(100, 999),
                    'customer_name' => $request->input('customer'),
                    'phone' => $request->input('phone'),
                    'address' => $request->input('address'),
                    'city' => $request->input('city'),
                    'total_price' => '0.00',
                    'status' => 'En attente',
                    'order_items' => [],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ], 201);
        }

        // ── Réponse générique de secours ──────────────────────────────────────
        return response()->json([
            'success' => true,
            'message' => 'Action effectuée avec succès.',
            'errors' => null,
            'data' => null,
        ], 201);
    }
}
