<?php

namespace App\Services;

use App\Models\Product;

class PersonalizationService
{
    /**
     * Générer les blocs de contenu personnalisés pour la homepage.
     */
    public function getHomepagePersonalization(?int $userId = null): array
    {
        $featuredProducts = Product::where('is_featured', true)
            ->take(4)
            ->get(['id', 'name', 'slug', 'price', 'image']);

        return [
            'hero_variant' => $userId ? 'returning_customer' : 'new_visitor',
            'featured_collection' => $featuredProducts,
            'promo_banner' => [
                'text' => $userId ? 'Bienvenue de nouveau — Profitez de -10% sur votre sélection' : 'Découvrez la Maison HAFROSE — Livraison Offerte dès 200€',
                'cta' => 'Voir la Collection',
                'url' => '/shop',
            ],
        ];
    }
}
