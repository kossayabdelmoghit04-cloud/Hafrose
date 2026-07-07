<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function test_can_list_products(): void
    {
        $token = $this->adminToken();
        Product::factory()->count(3)->create();

        $response = $this->withToken($token)->getJson('/api/admin/products');

        $response->assertOk()
                 ->assertJsonStructure(['data' => [['id', 'name', 'price', 'stock']]]);
    }

    public function test_products_are_paginated(): void
    {
        $token = $this->adminToken();
        Product::factory()->count(20)->create();

        $response = $this->withToken($token)->getJson('/api/admin/products');

        $response->assertOk()
                 ->assertJsonStructure(['meta' => ['current_page', 'last_page', 'total']]);
    }

    // ─── Store ────────────────────────────────────────────────────────────────

    public function test_can_create_product(): void
    {
        Storage::fake('public');
        $token    = $this->adminToken();
        $category = Category::factory()->create();

        $response = $this->withToken($token)->postJson('/api/admin/products', [
            'name'        => 'Parfum Oud Royal',
            'slug'        => 'parfum-oud-royal',
            'price'       => 299.99,
            'stock'       => 50,
            'category_id' => $category->id,
            'description' => 'Un parfum d\'exception.',
            'is_featured' => true,
            'is_active'   => true,
        ]);

        $response->assertCreated()
                 ->assertJsonFragment(['name' => 'Parfum Oud Royal']);

        $this->assertDatabaseHas('products', ['slug' => 'parfum-oud-royal']);
    }

    public function test_create_product_validates_price(): void
    {
        $token = $this->adminToken();
        Category::factory()->create();

        $response = $this->withToken($token)->postJson('/api/admin/products', [
            'name'  => 'Test',
            'slug'  => 'test',
            'price' => -10,
            'stock' => 5,
        ]);

        $response->assertUnprocessable();
    }

    public function test_can_create_product_with_image(): void
    {
        Storage::fake('public');
        $token    = $this->adminToken();
        $category = Category::factory()->create();

        $image = UploadedFile::fake()->create('product.jpg', 200, 'image/jpeg');

        $response = $this->withToken($token)->post('/api/admin/products', [
            'name'        => 'Produit Test',
            'slug'        => 'produit-test',
            'price'       => 99.99,
            'stock'       => 10,
            'category_id' => $category->id,
            'description' => 'Description du produit de test.',
            'image'       => $image,
        ], ['Accept' => 'application/json']);

        $response->assertCreated();
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public function test_can_update_product(): void
    {
        Storage::fake('public');
        $token   = $this->adminToken();
        $product = Product::factory()->create(['price' => 100.00]);

        $category = Category::factory()->create();

        $response = $this->withToken($token)->postJson("/api/admin/products/{$product->id}", [
            'name'        => $product->name,
            'slug'        => $product->slug,
            'price'       => 150.00,
            'stock'       => $product->stock,
            'category_id' => $category->id,
            'description' => 'Description mise à jour.',
        ]);

        $response->assertOk()
                 ->assertJsonPath('data.price', '150.00');
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function test_can_delete_product(): void
    {
        Storage::fake('public');
        $token   = $this->adminToken();
        $product = Product::factory()->create();

        $response = $this->withToken($token)->deleteJson("/api/admin/products/{$product->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_delete_nonexistent_product_returns_404(): void
    {
        $token = $this->adminToken();

        $response = $this->withToken($token)->deleteJson('/api/admin/products/99999');

        $response->assertNotFound();
    }
}
