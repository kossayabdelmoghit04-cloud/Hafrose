<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class V2EnterpriseExpansionTest extends TestCase
{
    use RefreshDatabase;

    public function test_currency_endpoint_returns_rates(): void
    {
        $response = $this->getJson('/api/currencies');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.base', 'EUR');
    }

    public function test_search_autocomplete(): void
    {
        $category = Category::create(['name' => 'Robes', 'slug' => 'robes']);
        Product::create([
            'category_id' => $category->id,
            'name' => 'Robe Merveilleuse',
            'slug' => 'robe-merveilleuse',
            'description' => 'Robe de soir',
            'price' => 950,
            'is_featured' => true,
        ]);

        $response = $this->getJson('/api/products/autocomplete?q=Robe');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
