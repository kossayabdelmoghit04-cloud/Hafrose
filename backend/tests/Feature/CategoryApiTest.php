<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de récupération de toutes les catégories.
     */
    public function test_can_get_all_categories(): void
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors',
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'slug',
                             'description',
                             'image',
                             'created_at',
                             'updated_at',
                         ]
                     ]
                 ]);

        $this->assertTrue($response['success']);
        $this->assertCount(3, $response['data']);
    }

    /**
     * Test de récupération d'une catégorie par son slug.
     */
    public function test_can_get_category_by_slug(): void
    {
        $category = Category::factory()->create([
            'name' => 'Sacs de Luxe',
            'slug' => 'sacs-de-luxe',
        ]);

        $response = $this->getJson('/api/categories/sacs-de-luxe');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id'   => $category->id,
                         'name' => 'Sacs de Luxe',
                         'slug' => 'sacs-de-luxe',
                     ]
                 ]);
    }

    /**
     * Test de récupération d'une catégorie inexistante (404).
     */
    public function test_category_not_found_returns_404(): void
    {
        $response = $this->getJson('/api/categories/non-existant-slug');

        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Resource not found',
                     'errors'  => null,
                     'data'    => null,
                 ]);
    }
}
