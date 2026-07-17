<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Gallery;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de récupération de tous les produits (avec structure de pagination).
     */
    public function test_can_get_paginated_products(): void
    {
        Product::factory()->count(15)->create();

        $response = $this->getJson('/api/products?per_page=10');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors',
                     'data' => [
                         'data' => [
                             '*' => [
                                 'id',
                                 'category_id',
                                 'name',
                                 'slug',
                                 'description',
                                 'short_description',
                                 'price',
                                 'stock',
                                 'color',
                                 'material',
                                 'brand',
                                 'image',
                                 'is_featured',
                                 'created_at',
                                 'updated_at',
                             ]
                         ],
                         'links',
                         'meta',
                     ]
                 ]);

        $this->assertTrue($response['success']);
        $this->assertCount(10, $response['data']['data']);
    }

    /**
     * Test du filtrage par catégorie, prix, couleur, matière, recherche et vedette.
     */
    public function test_can_filter_products(): void
    {
        $category1 = Category::factory()->create(['slug' => 'sacs']);
        $category2 = Category::factory()->create(['slug' => 'pochettes']);

        // Produit 1
        $p1 = Product::factory()->create([
            'category_id' => $category1->id,
            'name'        => 'Sac en Cuir Noir',
            'price'       => 150.00,
            'color'       => 'Noir',
            'material'    => 'Cuir',
            'is_featured' => true,
        ]);

        // Produit 2
        $p2 = Product::factory()->create([
            'category_id' => $category2->id,
            'name'        => 'Pochette en Coton Rouge',
            'price'       => 50.00,
            'color'       => 'Rouge',
            'material'    => 'Coton',
            'is_featured' => false,
        ]);

        // 1. Filtre par catégorie
        $response = $this->getJson('/api/products?category=sacs');
        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p1->id, $response['data']['data'][0]['id']);

        // 2. Filtre par prix min/max
        $response = $this->getJson('/api/products?min_price=100&max_price=200');
        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p1->id, $response['data']['data'][0]['id']);

        // 3. Filtre par couleur/matière
        $response = $this->getJson('/api/products?color=Rouge&material=Coton');
        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p2->id, $response['data']['data'][0]['id']);

        // 4. Filtre par recherche textuelle
        $response = $this->getJson('/api/products?search=Cuir');
        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p1->id, $response['data']['data'][0]['id']);

        // 5. Filtre par vedette
        $response = $this->getJson('/api/products?is_featured=true');
        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p1->id, $response['data']['data'][0]['id']);
    }

    /**
     * Test de récupération d'un produit par son slug avec ses galeries et avis approuvés.
     */
    public function test_can_get_product_by_slug_with_relations(): void
    {
        $product = Product::factory()->create(['slug' => 'produit-test']);
        
        Gallery::factory()->create(['product_id' => $product->id, 'image' => 'gal1.jpg']);
        Gallery::factory()->create(['product_id' => $product->id, 'image' => 'gal2.jpg']);
        
        // Avis approuvé
        Review::factory()->create([
            'product_id'  => $product->id,
            'is_approved' => true,
            'comment'     => 'Excellent produit',
        ]);

        // Avis non approuvé (ne doit pas être renvoyé)
        Review::factory()->create([
            'product_id'  => $product->id,
            'is_approved' => false,
            'comment'     => 'Mauvais produit',
        ]);

        $response = $this->getJson('/api/products/produit-test');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'category',
                         'galleries',
                         'reviews',
                     ]
                 ]);

        $this->assertCount(2, $response['data']['galleries']);
        $this->assertCount(1, $response['data']['reviews']);
        $this->assertEquals('Excellent produit', $response['data']['reviews'][0]['comment']);
    }

    /**
     * Test du produit non trouvé (404).
     */
    public function test_product_not_found_returns_404(): void
    {
        $response = $this->getJson('/api/products/non-existant-slug');

        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Resource not found',
                     'errors'  => null,
                     'data'    => null,
                 ]);
     }

    /**
     * Test de la recherche textuelle avancée avec le paramètre 'q'.
     */
    public function test_can_search_products_using_q(): void
    {
        $category = Category::factory()->create();
        
        $p1 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Sac exceptionnel HAFROSE',
            'description' => 'Un sac en cuir noble.',
        ]);

        $p2 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Montre Classique',
            'description' => 'Une montre intemporelle.',
        ]);

        $response = $this->getJson('/api/products?q=exceptionnel');

        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p1->id, $response['data']['data'][0]['id']);
    }

    /**
     * Test du filtrage par prix avec 'price_min' et 'price_max'.
     */
    public function test_can_filter_products_using_price_min_and_price_max(): void
    {
        $category = Category::factory()->create();

        $p1 = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 250.00,
        ]);

        $p2 = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 500.00,
        ]);

        $p3 = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 750.00,
        ]);

        $response = $this->getJson('/api/products?price_min=300&price_max=600');

        $response->assertStatus(200);
        $this->assertCount(1, $response['data']['data']);
        $this->assertEquals($p2->id, $response['data']['data'][0]['id']);
    }

    /**
     * Test du tri avec 'sort' et 'direction'.
     */
    public function test_can_sort_products_using_sort_and_direction(): void
    {
        $category = Category::factory()->create();

        $p1 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'A Product',
            'price' => 100.00,
        ]);

        $p2 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'B Product',
            'price' => 200.00,
        ]);

        // Tri par prix ascendant
        $response = $this->getJson('/api/products?sort=price&direction=asc');
        $response->assertStatus(200);
        $this->assertEquals($p1->id, $response['data']['data'][0]['id']);
        $this->assertEquals($p2->id, $response['data']['data'][1]['id']);

        // Tri par prix descendant
        $response = $this->getJson('/api/products?sort=price&direction=desc');
        $response->assertStatus(200);
        $this->assertEquals($p2->id, $response['data']['data'][0]['id']);
        $this->assertEquals($p1->id, $response['data']['data'][1]['id']);
    }

    /**
     * Test de la validation avec des paramètres invalides.
     */
    public function test_search_validates_inputs_and_returns_422(): void
    {
        // Direction de tri invalide
        $response = $this->getJson('/api/products?direction=invalid_dir');
        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation failed',
                 ])
                 ->assertJsonValidationErrors(['direction']);

        // Tri invalide
        $response = $this->getJson('/api/products?sort=invalid_sort');
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['sort']);

        // Prix négatif
        $response = $this->getJson('/api/products?price_min=-10');
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['price_min']);

        // per_page trop grand
        $response = $this->getJson('/api/products?per_page=500');
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['per_page']);
    }

    /**
     * Test de récupération des filtres dynamiques disponibles.
     */
    public function test_can_get_product_filters(): void
    {
        $category1 = Category::factory()->create(['name' => 'Sacs', 'slug' => 'sacs']);
        $category2 = Category::factory()->create(['name' => 'Montres', 'slug' => 'montres']);
        $categoryEmpty = Category::factory()->create(['name' => 'Empty', 'slug' => 'empty']);

        Product::factory()->create([
            'category_id' => $category1->id,
            'price' => 199.00,
        ]);

        Product::factory()->create([
            'category_id' => $category1->id,
            'price' => 500.00,
        ]);

        Product::factory()->create([
            'category_id' => $category2->id,
            'price' => 1499.00,
        ]);

        $response = $this->getJson('/api/products/filters');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors',
                     'data' => [
                         'categories' => [
                             '*' => [
                                 'id',
                                 'name',
                                 'slug',
                                 'count',
                                 'products_count',
                             ]
                         ],
                         'price' => [
                             'min',
                             'max',
                         ],
                         'products_count',
                     ]
                 ]);

        $data = $response->json('data');

        // Vérifier le nombre total de produits
        $this->assertEquals(3, $data['products_count']);

        // Vérifier les prix min et max
        $this->assertEquals(199, $data['price']['min']);
        $this->assertEquals(1499, $data['price']['max']);

        // Vérifier les catégories (la catégorie vide doit être exclue)
        $this->assertCount(2, $data['categories']);

        // Vérifier le décompte des produits pour la catégorie 'sacs'
        $sacCategory = collect($data['categories'])->firstWhere('slug', 'sacs');
        $this->assertNotNull($sacCategory);
        $this->assertEquals(2, $sacCategory['count']);
        $this->assertEquals(2, $sacCategory['products_count']);

        // Vérifier le décompte des produits pour la catégorie 'montres'
        $montreCategory = collect($data['categories'])->firstWhere('slug', 'montres');
        $this->assertNotNull($montreCategory);
        $this->assertEquals(1, $montreCategory['count']);
        $this->assertEquals(1, $montreCategory['products_count']);
    }
}
