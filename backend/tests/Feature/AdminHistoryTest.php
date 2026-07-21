<?php

namespace Tests\Feature;

use App\Models\AdminLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminHistoryTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email' => 'admin@hafrose.com',
            'role' => User::ROLE_ADMIN,
        ]);
    }

    private function createCustomer(): User
    {
        return User::factory()->create([
            'role' => 'customer',
        ]);
    }

    /**
     * Test unauthenticated access returns 401.
     */
    public function test_unauthenticated_user_cannot_access_history(): void
    {
        $response = $this->getJson('/api/admin/history/products/1');
        $response->assertUnauthorized();
    }

    /**
     * Test non-admin user returns 403.
     */
    public function test_non_admin_cannot_access_history(): void
    {
        $customer = $this->createCustomer();
        $token = $customer->createToken('token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/history/products/1');
        $response->assertForbidden();
    }

    /**
     * Test fetching history for a product.
     */
    public function test_admin_can_fetch_product_history(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;
        $category = Category::factory()->create();

        // Perform an update action that creates an AdminLog
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Original Name',
            'price' => 100.00,
        ]);

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_UPDATE,
            'resource' => AdminLog::RESOURCE_PRODUCT,
            'resource_id' => $product->id,
            'description' => 'Modification du produit : Original Name',
            'old_values' => ['name' => 'Original Name', 'price' => 100.00],
            'new_values' => ['name' => 'Updated Name', 'price' => 150.00],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
        ]);

        $response = $this->withToken($token)->getJson("/api/admin/history/products/{$product->id}");

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'admin' => ['id', 'name', 'email'],
                    'action',
                    'resource',
                    'resource_id',
                    'description',
                    'old_values',
                    'new_values',
                    'ip_address',
                    'user_agent',
                    'created_at',
                ],
            ],
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ],
        ]);

        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('Original Name', $response->json('data.0.old_values.name'));
    }

    /**
     * Test history filtering by action.
     */
    public function test_history_can_be_filtered_by_action(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_CREATE,
            'resource' => AdminLog::RESOURCE_PRODUCT,
            'resource_id' => 42,
            'description' => 'Création',
        ]);

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_UPDATE,
            'resource' => AdminLog::RESOURCE_PRODUCT,
            'resource_id' => 42,
            'description' => 'Modification',
        ]);

        $response = $this->withToken($token)->getJson('/api/admin/history/products/42?action=update');

        $response->assertOk();
        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('update', $response->json('data.0.action'));
    }
}
