<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Génère les 6 catégories de luxe prédéfinies dans la factory
        Category::factory()->count(6)->create();
    }
}
