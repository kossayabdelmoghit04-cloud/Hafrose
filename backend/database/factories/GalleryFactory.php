<?php

namespace Database\Factories;

use App\Models\Gallery;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Gallery>
 */
class GalleryFactory extends Factory
{
    protected $model = Gallery::class;

    private static int $imageNumber = 1;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        
        $num = self::$imageNumber++;
        return [
            'product_id' => $product->id,
            'image' => "products/gallery/img_{$num}.jpg",
        ];
    }
}
