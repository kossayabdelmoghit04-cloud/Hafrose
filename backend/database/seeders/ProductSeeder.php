<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Gallery;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        foreach ($categories as $category) {
            // Créer 4 produits réalistes pour chaque catégorie
            Product::factory()
                ->count(4)
                ->create(['category_id' => $category->id])
                ->each(function (Product $product) {
                    // Pour chaque produit, créer entre 2 et 4 images dans sa galerie
                    $imageCount = rand(2, 4);
                    for ($i = 1; $i <= $imageCount; $i++) {
                        Gallery::create([
                            'product_id' => $product->id,
                            'image' => 'products/gallery/' . $product->slug . '-details-' . $i . '.jpg',
                        ]);
                    }
                });
        }
    }
}
