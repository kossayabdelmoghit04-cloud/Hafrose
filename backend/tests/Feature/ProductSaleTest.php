<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSaleTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        return $admin->createToken('admin-token')->plainTextToken;
    }

    public function test_admin_can_create_product_with_sale_price(): void
    {
        $token = $this->adminToken();
        $category = Category::factory()->create();

        $response = $this->withToken($token)->postJson('/api/admin/products', [
            'name' => 'Robe Soie En Solde',
            'slug' => 'robe-soie-en-solde',
            'price' => 200.00,
            'sale_price' => 150.00,
            'stock' => 10,
            'category_id' => $category->id,
            'description' => 'Magnifique robe en soie soldée.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.price', '200.00')
            ->assertJsonPath('data.sale_price', '150.00')
            ->assertJsonPath('data.is_on_sale', true)
            ->assertJsonPath('data.discount_percentage', 25);

        $this->assertDatabaseHas('products', [
            'slug' => 'robe-soie-en-solde',
            'price' => 200.00,
            'sale_price' => 150.00,
        ]);
    }

    public function test_admin_cannot_create_product_where_sale_price_greater_or_equal_to_price(): void
    {
        $token = $this->adminToken();
        $category = Category::factory()->create();

        // sale_price > price
        $response1 = $this->withToken($token)->postJson('/api/admin/products', [
            'name' => 'Produit Invalide 1',
            'slug' => 'produit-invalide-1',
            'price' => 100.00,
            'sale_price' => 120.00,
            'stock' => 10,
            'category_id' => $category->id,
            'description' => 'Test',
        ]);
        $response1->assertUnprocessable()
            ->assertJsonValidationErrors(['sale_price']);

        // sale_price == price
        $response2 = $this->withToken($token)->postJson('/api/admin/products', [
            'name' => 'Produit Invalide 2',
            'slug' => 'produit-invalide-2',
            'price' => 100.00,
            'sale_price' => 100.00,
            'stock' => 10,
            'category_id' => $category->id,
            'description' => 'Test',
        ]);
        $response2->assertUnprocessable()
            ->assertJsonValidationErrors(['sale_price']);
    }

    public function test_admin_can_update_product_sale_price(): void
    {
        $token = $this->adminToken();
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 300.00,
            'sale_price' => null,
        ]);

        $response = $this->withToken($token)->postJson("/api/admin/products/{$product->id}", [
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => 300.00,
            'sale_price' => 180.00,
            'stock' => $product->stock,
            'category_id' => $category->id,
            'description' => $product->description,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.sale_price', '180.00')
            ->assertJsonPath('data.is_on_sale', true)
            ->assertJsonPath('data.discount_percentage', 40);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'sale_price' => 180.00,
        ]);
    }

    public function test_public_product_listing_filters_by_on_sale(): void
    {
        $category = Category::factory()->create();

        // Product on sale
        $saleProduct = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 200.00,
            'sale_price' => 140.00,
        ]);

        // Regular product without sale_price
        $regularProduct = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 150.00,
            'sale_price' => null,
        ]);

        // 1. Without filter: both returned
        $resAll = $this->getJson('/api/products');
        $resAll->assertOk();
        $idsAll = collect($resAll['data']['data'])->pluck('id')->all();
        $this->assertContains($saleProduct->id, $idsAll);
        $this->assertContains($regularProduct->id, $idsAll);

        // 2. With on_sale=true: only saleProduct returned
        $resSale = $this->getJson('/api/products?on_sale=true');
        $resSale->assertOk();
        $idsSale = collect($resSale['data']['data'])->pluck('id')->all();
        $this->assertContains($saleProduct->id, $idsSale);
        $this->assertNotContains($regularProduct->id, $idsSale);
    }

    public function test_filters_endpoint_returns_on_sale_count(): void
    {
        $category = Category::factory()->create();

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 200.00,
            'sale_price' => 150.00,
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 100.00,
            'sale_price' => null,
        ]);

        $response = $this->getJson('/api/products/filters');

        $response->assertOk()
            ->assertJsonPath('data.statistics.on_sale_count', 1);
    }

    public function test_model_scope_and_accessors(): void
    {
        $category = Category::factory()->create();

        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 500.00,
            'sale_price' => 350.00,
        ]);

        $this->assertTrue($product->is_on_sale);
        $this->assertEquals(30, $product->discount_percentage);

        $results = Product::onSale()->get();
        $this->assertTrue($results->contains('id', $product->id));
    }
}
