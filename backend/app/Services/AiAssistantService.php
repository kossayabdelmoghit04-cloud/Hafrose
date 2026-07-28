<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;

class AiAssistantService
{
    /**
     * Traiter le message de l'utilisateur avec le moteur IA Concierge HAFROSE.
     */
    public function reply(string $userMessage, ?int $userId = null): array
    {
        $msg = strtolower(trim($userMessage));

        // 1. Suivi de commande
        if (str_contains($msg, 'commande') || str_contains($msg, 'suivi') || str_contains($msg, 'order')) {
            if ($userId) {
                $lastOrder = Order::where('user_id', $userId)->latest()->first();
                if ($lastOrder) {
                    return [
                        'type' => 'order_status',
                        'reply' => "Votre dernière commande #{$lastOrder->order_number} est actuellement en statut: **{$lastOrder->status}**.",
                        'order' => [
                            'number' => $lastOrder->order_number,
                            'status' => $lastOrder->status,
                            'total' => $lastOrder->total_amount,
                        ],
                    ];
                }
            }
            return [
                'type' => 'info',
                'reply' => "Pour suivre votre commande, veuillez renseigner votre numéro de commande dans le Portail Client ou contacter notre conciergerie.",
            ];
        }

        // 2. Recherche et recommandation de produit
        if (str_contains($msg, 'recherche') || str_contains($msg, 'robe') || str_contains($msg, 'parfum') || str_contains($msg, 'produit') || str_contains($msg, 'cadeau')) {
            $products = Product::where('is_featured', true)
                ->take(3)
                ->get();

            return [
                'type' => 'product_suggestions',
                'reply' => "Voici quelques suggestions exclusives préparées par la Maison HAFROSE :",
                'products' => $products,
            ];
        }

        // 3. Réponse Conciergerie Générale
        return [
            'type' => 'text',
            'reply' => "Bonjour et bienvenue chez HAFROSE. Je suis votre Assistant Concierge. Comment puis-je vous accompagner aujourd'hui dans votre expérience de shopping ?",
        ];
    }
}
