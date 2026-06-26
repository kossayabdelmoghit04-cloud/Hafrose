<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    private static array $reviewsData = [
        [
            'rating' => 5,
            'comment' => 'Une merveille absolue. La qualité du cuir est exceptionnelle, les finitions sont parfaites. Le sac est livré dans une boîte somptueuse. Je recommande vivement !'
        ],
        [
            'rating' => 5,
            'comment' => 'Bracelet jonc sublime. Il a un éclat remarquable et se marie parfaitement avec d\'autres bijoux. Reçu très rapidement avec un mot personnalisé très attentionné.'
        ],
        [
            'rating' => 4,
            'comment' => 'Le chronographe est magnifique, le mouvement automatique est d\'une grande précision. Seul bémol, le bracelet en cuir est un peu rigide au début, mais s\'assouplit vite.'
        ],
        [
            'rating' => 5,
            'comment' => 'Les lunettes sont très élégantes et protègent parfaitement du soleil. La monture est légère et confortable. Une vraie pièce de créateur.'
        ],
        [
            'rating' => 5,
            'comment' => 'Ceinture d\'une qualité irréprochable. Le cuir de veau pleine fleur est très souple et la boucle en laiton brossé est d\'une grande finesse.'
        ],
        [
            'rating' => 4,
            'comment' => 'Très belle petite maroquinerie, le portefeuille est fonctionnel et élégant. La doublure en soie est une touche raffinée. Très satisfait de mon achat.'
        ],
        [
            'rating' => 5,
            'comment' => 'Un service client exceptionnel et un produit d\'une beauté rare. Hafrose incarne parfaitement l\'excellence de la maroquinerie française.'
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
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();

        if (self::$index < count(self::$contactsData ?? self::$reviewsData)) {
            $idx = self::$index % count(self::$reviewsData);
            self::$index++;
            $review = self::$reviewsData[$idx];
            return [
                'product_id' => $product->id,
                'customer_name' => $this->faker->name(),
                'rating' => $review['rating'],
                'comment' => $review['comment'],
                'is_approved' => $this->faker->boolean(85), // 85% d'avis validés
            ];
        }

        $rating = $this->faker->numberBetween(4, 5); // Le luxe a généralement de très bonnes notes
        return [
            'product_id' => $product->id,
            'customer_name' => $this->faker->name(),
            'rating' => $rating,
            'comment' => $this->faker->paragraph(2),
            'is_approved' => $this->faker->boolean(80),
        ];
    }
}
