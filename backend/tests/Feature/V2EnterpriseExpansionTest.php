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

    public function test_recommendations_for_you_returns_products(): void
    {
        $category = Category::create(['name' => 'Haute Parfumerie', 'slug' => 'haute-parfumerie']);
        Product::create([
            'category_id' => $category->id,
            'name' => 'Parfum Royal',
            'slug' => 'parfum-royal',
            'description' => 'Un parfum noble.',
            'price' => 250,
            'is_featured' => true,
        ]);

        $response = $this->getJson('/api/recommendations/for-you');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
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

    public function test_ai_assistant_chat_response(): void
    {
        $response = $this->postJson('/api/ai/chat', ['message' => 'Bonjour assistant']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
