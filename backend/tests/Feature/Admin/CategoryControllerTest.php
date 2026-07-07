<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function test_can_list_categories(): void
    {
        $token = $this->adminToken();
        Category::factory()->count(5)->create();

        $response = $this->withToken($token)->getJson('/api/admin/categories');

        $response->assertOk()
                 ->assertJsonStructure(['data' => [['id', 'name', 'slug']]]);
    }

    public function test_categories_list_requires_auth(): void
    {
        $this->getJson('/api/admin/categories')->assertUnauthorized();
    }

    // ─── Store ────────────────────────────────────────────────────────────────

    public function test_can_create_category(): void
    {
        Storage::fake('public');
        $token = $this->adminToken();

        $response = $this->withToken($token)->postJson('/api/admin/categories', [
            'name'        => 'Parfums',
            'slug'        => 'parfums',
            'description' => 'Collection de parfums de luxe.',
        ]);

        $response->assertCreated()
                 ->assertJsonFragment(['name' => 'Parfums']);

        $this->assertDatabaseHas('categories', ['slug' => 'parfums']);
    }

    public function test_create_category_validates_required_fields(): void
    {
        $token = $this->adminToken();

        $response = $this->withToken($token)->postJson('/api/admin/categories', []);

        $response->assertUnprocessable()
                 ->assertJsonStructure(['errors']);
    }

    public function test_create_category_validates_unique_slug(): void
    {
        Category::factory()->create(['slug' => 'existing-slug']);
        $token = $this->adminToken();

        $response = $this->withToken($token)->postJson('/api/admin/categories', [
            'name' => 'Test',
            'slug' => 'existing-slug',
        ]);

        $response->assertUnprocessable();
    }

    public function test_can_create_category_with_image_upload(): void
    {
        Storage::fake('public');
        $token = $this->adminToken();

        // Use create() instead of image() to avoid GD extension requirement
        $file = UploadedFile::fake()->create('category.jpg', 200, 'image/jpeg');

        $response = $this->withToken($token)->post('/api/admin/categories', [
            'name'  => 'Bijoux',
            'slug'  => 'bijoux',
            'image' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertCreated();
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public function test_can_update_category(): void
    {
        Storage::fake('public');
        $token    = $this->adminToken();
        $category = Category::factory()->create(['name' => 'Old Name', 'slug' => 'old-slug']);

        $response = $this->withToken($token)->postJson("/api/admin/categories/{$category->id}", [
            'name' => 'New Name',
            'slug' => 'new-slug',
        ]);

        $response->assertOk()
                 ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name']);
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function test_can_delete_category_without_products(): void
    {
        Storage::fake('public');
        $token    = $this->adminToken();
        $category = Category::factory()->create();

        $response = $this->withToken($token)->deleteJson("/api/admin/categories/{$category->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_cannot_delete_category_with_products(): void
    {
        $token    = $this->adminToken();
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);

        $response = $this->withToken($token)->deleteJson("/api/admin/categories/{$category->id}");

        // Backend returns 409 Conflict when category has linked products
        $response->assertStatus(409);
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }
}
