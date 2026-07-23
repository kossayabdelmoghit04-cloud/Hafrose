<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedProductApiTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    //  1. SIMILAR PRODUCTS (GET /api/products/{product}/similar)
    // =========================================================================

    public function test_similar_returns_products_from_same_category(): void
    {
        $cat1 = Category::factory()->create();
        $cat2 = Category::factory()->create();

        $current = Product::factory()->create(['category_id' => $cat1->id]);

        // Same category
        $similar1 = Product::factory()->create(['category_id' => $cat1->id]);
        $similar2 = Product::factory()->create(['category_id' => $cat1->id]);

        // Different category
        $other = Product::factory()->create(['category_id' => $cat2->id]);

        $response = $this->getJson("/api/products/{$current->id}/similar");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price', 'category_id'],
                ],
            ]);

        $returnedIds = collect($response['data'])->pluck('id')->all();

        $this->assertContains($similar1->id, $returnedIds);
        $this->assertContains($similar2->id, $returnedIds);
        $this->assertNotContains($current->id, $returnedIds);
        $this->assertNotContains($other->id, $returnedIds);
    }

    public function test_similar_returns_404_for_nonexistent_product(): void
    {
        $response = $this->getJson('/api/products/99999/similar');
        $response->assertStatus(404);
    }

    public function test_similar_respects_max_limit_of_eight(): void
    {
        $cat = Category::factory()->create();
        $current = Product::factory()->create(['category_id' => $cat->id]);

        // Create 10 other products in same category
        Product::factory()->count(10)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/products/{$current->id}/similar");

        $response->assertStatus(200);
        $this->assertLessThanOrEqual(8, count($response['data']));
    }

    // =========================================================================
    //  2. POPULAR PRODUCTS (GET /api/products/popular)
    // =========================================================================

    public function test_popular_calculates_weighted_scores_correctly(): void
    {
        $category = Category::factory()->create();

        // Product A: 3 orders, no reviews (Score: 3 * 3 = 9)
        $productA = Product::factory()->create(['category_id' => $category->id]);
        $order1 = Order::factory()->create();
        OrderItem::factory()->count(3)->create([
            'product_id' => $productA->id,
            'order_id' => $order1->id,
        ]);

        // Product B: 1 order, 5 reviews with 5.0 rating (Score: 1 * 3 + 5 * 5 + 5 * 2 = 3 + 25 + 10 = 38)
        $productB = Product::factory()->create(['category_id' => $category->id]);
        $order2 = Order::factory()->create();
        OrderItem::factory()->create([
            'product_id' => $productB->id,
            'order_id' => $order2->id,
        ]);
        Review::factory()->count(5)->create([
            'product_id' => $productB->id,
            'rating' => 5,
            'is_approved' => true,
        ]);

        // Product C: no orders, 1 review with 1.0 rating (Score: 0 * 3 + 1 * 5 + 1 * 2 = 7)
        $productC = Product::factory()->create(['category_id' => $category->id]);
        Review::factory()->create([
            'product_id' => $productC->id,
            'rating' => 1,
            'is_approved' => true,
        ]);

        $response = $this->getJson('/api/products/popular');

        $response->assertStatus(200);
        $returnedIds = collect($response['data'])->pluck('id')->all();

        // Expected order: B (38), A (9), C (7)
        $this->assertEquals($productB->id, $returnedIds[0]);
        $this->assertEquals($productA->id, $returnedIds[1]);
        $this->assertEquals($productC->id, $returnedIds[2]);
    }

    public function test_popular_respects_custom_limit_query_param(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products/popular?limit=3');

        $response->assertStatus(200);
        $this->assertCount(3, $response['data']);
    }

    public function test_popular_returns_validation_error_for_invalid_limit(): void
    {
        $response = $this->getJson('/api/products/popular?limit=invalid');
        $response->assertStatus(422);

        $response = $this->getJson('/api/products/popular?limit=999');
        $response->assertStatus(422);
    }

    // =========================================================================
    //  3. ADVANCED SEARCH (GET /api/products/search)
    // =========================================================================

    public function test_search_returns_paginated_products_for_empty_query(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products/search');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'slug', 'price'],
                    ],
                    'links',
                    'meta',
                ],
            ]);

        $this->assertCount(5, $response['data']['data']);
    }

    public function test_search_by_text_query(): void
    {
        $category = Category::factory()->create(['name' => 'Maroquinerie']);

        $product1 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Sac à main Signature',
            'description' => 'Un classique',
        ]);

        $product2 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Ceinture Noire',
            'description' => 'Matière cuir véritable',
        ]);

        // Search for 'Sac' -> matches only product1 (name)
        $response = $this->getJson('/api/products/search?q=Sac');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();
        $this->assertContains($product1->id, $returnedIds);
        $this->assertNotContains($product2->id, $returnedIds);

        // Search for 'cuir' -> matches only product2 (description)
        $response = $this->getJson('/api/products/search?q=cuir');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();
        $this->assertContains($product2->id, $returnedIds);
        $this->assertNotContains($product1->id, $returnedIds);

        // Search for category name 'Maroquinerie' -> matches both products via category
        $response = $this->getJson('/api/products/search?q=Maroquinerie');
        $response->assertStatus(200);
        $this->assertCount(2, $response['data']['data']);
    }

    public function test_search_combines_filters(): void
    {
        $category1 = Category::factory()->create(['slug' => 'bijoux']);
        $category2 = Category::factory()->create(['slug' => 'sacs']);

        $product1 = Product::factory()->create([
            'category_id' => $category1->id,
            'price' => 1500.00,
            'brand' => 'Hafrose',
        ]);

        $product2 = Product::factory()->create([
            'category_id' => $category1->id,
            'price' => 3000.00,
            'brand' => 'Hafrose',
        ]);

        $product3 = Product::factory()->create([
            'category_id' => $category2->id,
            'price' => 1500.00,
            'brand' => 'Hafrose',
        ]);

        $product4 = Product::factory()->create([
            'category_id' => $category1->id,
            'price' => 1500.00,
            'brand' => 'Autre Marque',
        ]);

        // Filter: Category=bijoux & price_min=1000 & price_max=2000 & brand=Hafrose -> matches only product1
        $response = $this->getJson('/api/products/search?category=bijoux&price_min=1000&price_max=2000&brand=Hafrose');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();

        $this->assertCount(1, $returnedIds);
        $this->assertEquals($product1->id, $returnedIds[0]);
    }

    public function test_search_sorts_correctly(): void
    {
        $category = Category::factory()->create();

        $product1 = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 500.00,
            'created_at' => now()->subDays(2),
        ]);

        $product2 = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 1500.00,
            'created_at' => now()->subDay(),
        ]);

        $product3 = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 1000.00,
            'created_at' => now(),
        ]);

        // Sort: price_asc -> 1, 3, 2
        $response = $this->getJson('/api/products/search?sort=price_asc');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();
        $this->assertEquals([$product1->id, $product3->id, $product2->id], $returnedIds);

        // Sort: price_desc -> 2, 3, 1
        $response = $this->getJson('/api/products/search?sort=price_desc');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();
        $this->assertEquals([$product2->id, $product3->id, $product1->id], $returnedIds);

        // Sort: newest -> 3, 2, 1
        $response = $this->getJson('/api/products/search?sort=newest');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();
        $this->assertEquals([$product3->id, $product2->id, $product1->id], $returnedIds);

        // Sort: oldest -> 1, 2, 3
        $response = $this->getJson('/api/products/search?sort=oldest');
        $response->assertStatus(200);
        $returnedIds = collect($response['data']['data'])->pluck('id')->all();
        $this->assertEquals([$product1->id, $product2->id, $product3->id], $returnedIds);
    }

    public function test_search_validates_min_max_price(): void
    {
        $response = $this->getJson('/api/products/search?price_min=500&price_max=200');
        $response->assertStatus(422); // price_max must be >= price_min
    }

    // =========================================================================
    //  4. DYNAMIC FILTERS (GET /api/products/filters)
    // =========================================================================

    public function test_filters_returns_brands_and_statistics(): void
    {
        $category = Category::factory()->create();
        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 100.00,
            'brand' => 'Hafrose',
            'stock' => 50,
            'is_featured' => true,
        ]);
        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 200.00,
            'brand' => 'Maison H',
            'stock' => 100,
            'is_featured' => false,
        ]);

        $response = $this->getJson('/api/products/filters');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'categories',
                    'price' => ['min', 'max'],
                    'products_count',
                    'brands',
                    'statistics' => [
                        'average_price',
                        'total_stock',
                        'featured_count',
                    ],
                ],
            ]);

        $this->assertEquals(100.0, $response['data']['price']['min']);
        $this->assertEquals(200.0, $response['data']['price']['max']);
        $this->assertEquals(2, $response['data']['products_count']);

        // Brands checks
        $this->assertContains('Hafrose', $response['data']['brands']);
        $this->assertContains('Maison H', $response['data']['brands']);

        // Statistics checks
        $this->assertEquals(150.0, $response['data']['statistics']['average_price']);
        $this->assertEquals(150, $response['data']['statistics']['total_stock']);
        $this->assertEquals(1, $response['data']['statistics']['featured_count']);
    }
}
