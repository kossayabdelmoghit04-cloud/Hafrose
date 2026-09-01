<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_index_returns_normalized_paginated_contract(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(15)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products?page=1&per_page=5');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price'],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
                'links' => [
                    'first',
                    'last',
                    'prev',
                    'next',
                ],
            ]);

        $json = $response->json();

        // 1. success must be true
        $this->assertTrue($json['success']);

        // 2. data must be a direct array of products, not wrapped in data.data
        $this->assertIsArray($json['data']);
        $this->assertCount(5, $json['data']);
        $this->assertArrayNotHasKey('data', $json['data'][0] ?? []);

        // 3. meta must exist at root
        $this->assertEquals(1, $json['meta']['current_page']);
        $this->assertEquals(3, $json['meta']['last_page']);
        $this->assertEquals(5, $json['meta']['per_page']);
        $this->assertEquals(15, $json['meta']['total']);

        // 4. links must exist at root
        $this->assertNotNull($json['links']['first']);
        $this->assertNotNull($json['links']['last']);
        $this->assertNull($json['links']['prev']);
        $this->assertNotNull($json['links']['next']);
    }

    public function test_products_search_returns_normalized_paginated_contract(): void
    {
        $category = Category::factory()->create(['name' => 'Accessoires']);
        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'name' => 'Collier Or Précieux',
        ]);

        $response = $this->getJson('/api/products/search?q=Collier&page=1&per_page=12');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price'],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);

        $json = $response->json();
        $this->assertTrue($json['success']);
        $this->assertIsArray($json['data']);
        $this->assertCount(4, $json['data']);
        $this->assertEquals(4, $json['meta']['total']);
    }
}
