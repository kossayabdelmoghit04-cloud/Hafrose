<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * Liste des catégories prédéfinies de la marque Hafrose
     */
    private static array $categories = [
        [
            'name' => 'Sacs',
            'description' => 'Sacs à main, cabas et pochettes façonnés dans des cuirs d\'exception.'
        ],
        [
            'name' => 'Bijoux',
            'description' => 'Créations précieuses plaquées or et ornées de pierres raffinées.'
        ],
        [
            'name' => 'Montres',
            'description' => 'Garde-temps automatiques et chronographes à l\'élégance intemporelle.'
        ],
        [
            'name' => 'Lunettes',
            'description' => 'Lunettes de soleil de créateur alliant protection et style affirmé.'
        ],
        [
            'name' => 'Ceintures',
            'description' => 'Ceintures en cuir pleine fleur aux boucles finement ciselées.'
        ],
        [
            'name' => 'Portefeuilles',
            'description' => 'Petite maroquinerie de luxe alliant esthétique et fonctionnalité.'
        ]
    ];

    private static int $index = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        if (self::$index < count(self::$categories)) {
            $category = self::$categories[self::$index++];
            return [
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'image' => 'categories/' . Str::slug($category['name']) . '.jpg',
            ];
        }

        $name = $this->faker->unique()->words(2, true);
        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'image' => 'categories/default.jpg',
        ];
    }
}
