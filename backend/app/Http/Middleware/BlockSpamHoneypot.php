<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockSpamHoneypot
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $fieldName = config('honeypot.field_name', 'website');

        if (config('honeypot.enabled', true) && $request->has($fieldName) && !empty($request->input($fieldName))) {
            // Honeypot déclenché ! Nous retournons une fausse réponse de succès (silencieuse) cohérente avec la route.
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

            if ($request->is('api/reviews*') || $request->is('reviews*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Avis créé avec succès, en attente d\'approbation.',
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

            // Réponse de secours générique
            return response()->json([
                'success' => true,
                'message' => 'Action effectuée avec succès.',
                'errors' => null,
                'data' => null,
            ], 201);
        }

        return $next($request);
    }
}
