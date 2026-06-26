<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Données de produits d'exception par catégorie pour un peuplement luxueux et réaliste
     */
    private static array $productsData = [
        'Sacs' => [
            [
                'name' => 'Sac à main Cabas en cuir d\'autruche',
                'price' => 1850.00,
                'material' => 'Cuir d\'autruche véritable',
                'short' => 'L\'élégance intemporelle d\'un cabas structuré en cuir précieux.'
            ],
            [
                'name' => 'Pochette de soirée en satin et cristal',
                'price' => 750.00,
                'material' => 'Satin de soie & Cristal',
                'short' => 'Une pochette étincelante conçue pour sublimer vos tenues de gala.'
            ],
            [
                'name' => 'Sac à dos Signature cuir pleine fleur',
                'price' => 980.00,
                'material' => 'Cuir de veau pleine fleur',
                'short' => 'L\'alliance de la fonctionnalité moderne et du savoir-faire traditionnel.'
            ],
            [
                'name' => 'Cabas de voyage en toile enduite',
                'price' => 1200.00,
                'material' => 'Toile monogramme & Cuir saffiano',
                'short' => 'Un grand volume chic et résistant pour vos escapades exclusives.'
            ]
        ],
        'Bijoux' => [
            [
                'name' => 'Bracelet Jonc plaqué or 24K',
                'price' => 350.00,
                'material' => 'Plaqué or jaune 24 carats',
                'short' => 'Un jonc épuré et lumineux, délicatement martelé à la main.'
            ],
            [
                'name' => 'Boucles d\'oreilles perles de culture',
                'price' => 480.00,
                'material' => 'Or jaune 18K & Perles de culture',
                'short' => 'Des perles d\'eau douce suspendues à de délicats anneaux en or 18 carats.'
            ],
            [
                'name' => 'Collier Pendentif diamant de synthèse',
                'price' => 1250.00,
                'material' => 'Or blanc 18K & Diamant de synthèse',
                'short' => 'Un solitaire éclatant monté sur une fine chaîne en or blanc.'
            ],
            [
                'name' => 'Bague Solitaire éclat infini',
                'price' => 890.00,
                'material' => 'Platine massif',
                'short' => 'Une bague de caractère au sertissage raffiné mettant en valeur l\'éclat.'
            ]
        ],
        'Montres' => [
            [
                'name' => 'Chronographe Automatique Héritage',
                'price' => 2450.00,
                'material' => 'Acier 316L & Cuir alligator',
                'short' => 'Un mouvement mécanique de haute précision abrité dans un boîtier classique.'
            ],
            [
                'name' => 'Montre Squelette Or Rose',
                'price' => 3800.00,
                'material' => 'Or rose 18K & Verre Saphir',
                'short' => 'Admirez les rouages de ce garde-temps d\'exception à travers son cadran squelette.'
            ],
            [
                'name' => 'Garde-temps Classique cadran nacre',
                'price' => 1650.00,
                'material' => 'Acier & Nacre véritable',
                'short' => 'Une montre féminine et précieuse ornée de discrets index diamants.'
            ],
            [
                'name' => 'Montre Sport Chic Lunette Céramique',
                'price' => 2100.00,
                'material' => 'Acier & Céramique noire',
                'short' => 'Robuste, étanche et élégante, idéale pour un style de vie dynamique.'
            ]
        ],
        'Lunettes' => [
            [
                'name' => 'Lunettes Aviateur monture dorée',
                'price' => 280.00,
                'material' => 'Métal doré & Verres polarisés',
                'short' => 'Le grand classique aviateur revisité avec des gravures Hafrose sur les branches.'
            ],
            [
                'name' => 'Lunettes Papillon acétate écaille',
                'price' => 310.00,
                'material' => 'Acétate de cellulose italien',
                'short' => 'Une silhouette rétro-chic ultra-féminine aux nuances écaille chaudes.'
            ],
            [
                'name' => 'Lunettes de soleil Masque Signature',
                'price' => 350.00,
                'material' => 'Acétate & Inserts titane',
                'short' => 'Un design audacieux et contemporain pour un style résolument affirmé.'
            ],
            [
                'name' => 'Lunettes Carrées verres dégradés',
                'price' => 295.00,
                'material' => 'Acétate bio-sourcé',
                'short' => 'Une monture oversize noire aux verres teintés pour un effet mystérieux.'
            ]
        ],
        'Ceintures' => [
            [
                'name' => 'Ceinture Classique boucle laiton brossé',
                'price' => 220.00,
                'material' => 'Cuir de veau pleine fleur',
                'short' => 'La ceinture indispensable au quotidien, ajustée et finie à la perfection.'
            ],
            [
                'name' => 'Ceinture Réversible cuir de veau',
                'price' => 290.00,
                'material' => 'Cuir de veau double face',
                'short' => 'Doublez vos options de style avec cette ceinture bicolore réversible.'
            ],
            [
                'name' => 'Ceinture Fine cuir saffiano',
                'price' => 180.00,
                'material' => 'Cuir saffiano',
                'short' => 'Une ceinture fine idéale pour cintrer une robe ou une veste de tailleur.'
            ],
            [
                'name' => 'Ceinture Large boucle monogramme',
                'price' => 340.00,
                'material' => 'Cuir grainé & Laiton doré',
                'short' => 'Affichez votre style avec cette boucle monogramme Hafrose exclusive.'
            ]
        ],
        'Portefeuilles' => [
            [
                'name' => 'Compagnon Zippé cuir grainé',
                'price' => 450.00,
                'material' => 'Cuir de veau grainé',
                'short' => 'Un grand portefeuille très complet pour organiser vos cartes, billets et documents.'
            ],
            [
                'name' => 'Porte-cartes minimaliste en crocodile',
                'price' => 580.00,
                'material' => 'Cuir de crocodile véritable',
                'short' => 'Un accessoire d\'une extrême finesse se glissant discrètement dans vos poches.'
            ],
            [
                'name' => 'Portefeuille à rabat doublure soie',
                'price' => 380.00,
                'material' => 'Cuir saffiano & Doublure soie',
                'short' => 'Un portefeuille élégant s\'ouvrant sur un intérieur raffiné en soie jacquard.'
            ],
            [
                'name' => 'Porte-monnaie Signature monogramme',
                'price' => 240.00,
                'material' => 'Toile monogramme & Finitions cuir',
                'short' => 'Compact, charmant et logeable, parfait pour emporter l\'essentiel.'
            ]
        ]
    ];

    private static array $counts = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category = Category::inRandomOrder()->first() ?? Category::factory()->create();
        $catName = $category->name;

        if (isset(self::$productsData[$catName])) {
            if (!isset(self::$counts[$catName])) {
                self::$counts[$catName] = 0;
            }

            $list = self::$productsData[$catName];
            $idx = self::$counts[$catName] % count($list);
            self::$counts[$catName]++;

            $product = $list[$idx];
            
            // Gestion de l'unicité du nom en cas de générations multiples
            $iteration = ceil(self::$counts[$catName] / count($list));
            $suffix = $iteration > 1 ? ' - Édition ' . $iteration : '';
            $productName = $product['name'] . $suffix;

            return [
                'category_id' => $category->id,
                'name' => $productName,
                'slug' => Str::slug($productName),
                'description' => $product['short'] . ' ' . $this->faker->paragraph(4),
                'short_description' => $product['short'],
                'price' => $product['price'],
                'stock' => $this->faker->numberBetween(3, 15), // Stock limité pour le luxe
                'color' => $this->faker->randomElement(['Noir Ébène', 'Rouge Rubis', 'Rose Poudré', 'Cognac', 'Vert Émeraude', 'Bleu Nuit', 'Or Miroir', 'Argent Satiné', 'Écaille Blonde']),
                'material' => $product['material'],
                'brand' => $this->faker->randomElement(['Hafrose', 'Hafrose Atelier', 'Hafrose Privé']),
                'image' => 'products/' . Str::slug($product['name']) . '.jpg',
                'is_featured' => $this->faker->boolean(25), // 25% de produits vedettes
            ];
        }

        $name = $this->faker->unique()->words(3, true);
        return [
            'category_id' => $category->id,
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(4),
            'short_description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 150, 1500),
            'stock' => $this->faker->numberBetween(2, 20),
            'color' => $this->faker->colorName(),
            'material' => $this->faker->word(),
            'brand' => 'Hafrose',
            'image' => 'products/default.jpg',
            'is_featured' => $this->faker->boolean(20),
        ];
    }
}
