<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests des APIs de recommandation HAFROSE.
 *
 * Couvre :
 *  - GET /api/products/popular  (Produits populaires)
 *  - GET /api/products/{product}/related  (Produits similaires)
 */
class RecommendationApiTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    //  TESTS — GET /api/products/popular
    // =========================================================================

    /**
     * L'endpoint retourne 200 avec la structure JSON attendue.
     */
    public function test_popular_returns_200_with_correct_structure(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products/popular');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors',
                     'data' => [
                         '*' => [
                             'id',
                             'category_id',
                             'name',
                             'slug',
                             'price',
                             'stock',
                             'image',
                             'is_featured',
                             'created_at',
                             'updated_at',
                         ],
                     ],
                 ]);

        $this->assertTrue($response['success']);
    }

    /**
     * Les produits les plus commandés apparaissent en premier.
     */
    public function test_popular_orders_by_order_items_count(): void
    {
        $category = Category::factory()->create();

        $popular = Product::factory()->create([
            'category_id' => $category->id,
            'name'        => 'Produit Populaire',
        ]);

        $unpopular = Product::factory()->create([
            'category_id' => $category->id,
            'name'        => 'Produit Impopulaire',
        ]);

        // Créer 3 commandes pour $popular
        $order = Order::factory()->create();
        OrderItem::factory()->count(3)->create([
            'product_id' => $popular->id,
            'order_id'   => $order->id,
        ]);

        $response = $this->getJson('/api/products/popular');

        $response->assertStatus(200);
        $this->assertEquals($popular->id, $response['data'][0]['id']);
    }

    /**
     * L'endpoint ne retourne pas plus de produits que la limite configurée.
     */
    public function test_popular_respects_limit(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(12)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products/popular');

        $response->assertStatus(200);
        // Limite par défaut = 8
        $this->assertLessThanOrEqual(8, count($response['data']));
    }

    /**
     * Aucun doublon dans la liste des produits populaires.
     */
    public function test_popular_contains_no_duplicates(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products/popular');
        $response->assertStatus(200);

        $ids = collect($response['data'])->pluck('id')->all();
        $this->assertEquals($ids, array_unique($ids));
    }

    /**
     * L'endpoint retourne une liste vide (pas d'erreur) quand il n'y a aucun produit.
     */
    public function test_popular_returns_empty_array_when_no_products(): void
    {
        $response = $this->getJson('/api/products/popular');

        $response->assertStatus(200);
        $this->assertEmpty($response['data']);
    }

    /**
     * Tous les produits retournés existent réellement en base.
     */
    public function test_popular_returns_only_existing_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(4)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products/popular');
        $response->assertStatus(200);

        foreach ($response['data'] as $item) {
            $this->assertDatabaseHas('products', ['id' => $item['id']]);
        }
    }

    // =========================================================================
    //  TESTS — GET /api/products/{product}/related
    // =========================================================================

    /**
     * L'endpoint retourne 200 avec la structure JSON attendue.
     */
    public function test_related_returns_200_with_correct_structure(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->count(4)->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/products/{$product->id}/related");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors',
                     'data' => [
                         '*' => [
                             'id',
                             'category_id',
                             'name',
                             'slug',
                             'price',
                             'stock',
                             'image',
                             'is_featured',
                             'created_at',
                             'updated_at',
                         ],
                     ],
                 ]);

        $this->assertTrue($response['success']);
    }

    /**
     * Le produit courant n'apparaît jamais dans les produits similaires.
     */
    public function test_related_excludes_current_product(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create(['category_id' => $category->id, 'price' => 500.00]);
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/products/{$product->id}/related");
        $response->assertStatus(200);

        $returnedIds = collect($response['data'])->pluck('id')->all();
        $this->assertNotContains($product->id, $returnedIds);
    }

    /**
     * L'algorithme trie bien par proximité de prix.
     * Produit à 650 DH → le résultat le plus proche en prix doit être en premier.
     */
    public function test_related_sorts_by_price_proximity(): void
    {
        $category = Category::factory()->create();

        // Produit courant : 650 DH
        $current = Product::factory()->create([
            'category_id' => $category->id,
            'price'       => 650.00,
        ]);

        // Produits proches (dans la même catégorie)
        $close1 = Product::factory()->create(['category_id' => $category->id, 'price' => 620.00]); // ∆ = 30
        $close2 = Product::factory()->create(['category_id' => $category->id, 'price' => 690.00]); // ∆ = 40
        $close3 = Product::factory()->create(['category_id' => $category->id, 'price' => 700.00]); // ∆ = 50
        $far    = Product::factory()->create(['category_id' => $category->id, 'price' => 120.00]); // ∆ = 530

        $response = $this->getJson("/api/products/{$current->id}/related");
        $response->assertStatus(200);

        $data = $response['data'];
        $this->assertGreaterThan(0, count($data));

        // Le premier résultat doit être le produit le plus proche en prix (620 DH)
        $this->assertEquals($close1->id, $data[0]['id']);
    }

    /**
     * L'endpoint ne retourne pas plus de produits que la limite configurée (défaut : 4).
     */
    public function test_related_respects_limit(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->count(10)->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/products/{$product->id}/related");
        $response->assertStatus(200);

        $this->assertLessThanOrEqual(4, count($response['data']));
    }

    /**
     * Aucun doublon dans les produits similaires.
     */
    public function test_related_contains_no_duplicates(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->count(8)->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/products/{$product->id}/related");
        $response->assertStatus(200);

        $ids = collect($response['data'])->pluck('id')->all();
        $this->assertEquals($ids, array_unique($ids));
    }

    /**
     * Si la catégorie contient peu de produits, complète avec les produits les plus récents
     * (sans dupliquer et sans inclure le produit courant).
     */
    public function test_related_fills_with_recent_products_when_category_has_few_items(): void
    {
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        // Seul 1 autre produit dans la même catégorie
        $current  = Product::factory()->create(['category_id' => $category1->id]);
        $sameCat  = Product::factory()->create(['category_id' => $category1->id]);

        // 5 produits récents dans une autre catégorie (fallback)
        $others = Product::factory()->count(5)->create(['category_id' => $category2->id]);

        $response = $this->getJson("/api/products/{$current->id}/related");
        $response->assertStatus(200);

        $returnedIds = collect($response['data'])->pluck('id')->all();

        // Le produit courant est absent
        $this->assertNotContains($current->id, $returnedIds);

        // Le résultat contient bien le produit de la même catégorie
        $this->assertContains($sameCat->id, $returnedIds);

        // Le résultat est complété avec des produits d'autres catégories
        $this->assertCount(4, $returnedIds);

        // Pas de doublon
        $this->assertEquals($returnedIds, array_unique($returnedIds));
    }

    /**
     * Un produit inexistant retourne 404.
     */
    public function test_related_returns_404_for_nonexistent_product(): void
    {
        $response = $this->getJson('/api/products/99999/related');

        $response->assertStatus(404);
    }

    /**
     * Les produits similaires retournés existent tous en base.
     */
    public function test_related_returns_only_existing_products(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $response = $this->getJson("/api/products/{$product->id}/related");
        $response->assertStatus(200);

        foreach ($response['data'] as $item) {
            $this->assertDatabaseHas('products', ['id' => $item['id']]);
        }
    }

    // =========================================================================
    //  TESTS — Non-régression des endpoints existants
    // =========================================================================

    /**
     * GET /api/products/filters fonctionne toujours correctement.
     */
    public function test_existing_filters_endpoint_still_works(): void
    {
        $category = Category::factory()->create(['slug' => 'sacs']);
        Product::factory()->create(['category_id' => $category->id, 'price' => 500.00]);

        $response = $this->getJson('/api/products/filters');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => ['categories', 'price', 'products_count'],
                 ]);
    }

    /**
     * GET /api/products fonctionne toujours correctement.
     */
    public function test_existing_product_list_endpoint_still_works(): void
    {
        Category::factory()->create();
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => ['data', 'links', 'meta'],
                 ]);
    }

    /**
     * GET /api/products/{slug} fonctionne toujours correctement.
     */
    public function test_existing_product_show_endpoint_still_works(): void
    {
        $category = Category::factory()->create();
        $product  = Product::factory()->create([
            'category_id' => $category->id,
            'slug'        => 'test-slug-show',
        ]);

        $response = $this->getJson('/api/products/test-slug-show');

        $response->assertStatus(200)
                 ->assertJsonFragment(['id' => $product->id]);
    }
}
