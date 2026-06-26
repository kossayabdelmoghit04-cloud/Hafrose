<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            // Créer entre 1 et 3 avis réalistes par produit
            $reviewCount = rand(1, 3);
            Review::factory()
                ->count($reviewCount)
                ->create(['product_id' => $product->id]);
        }
    }
}
