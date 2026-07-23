<?php

namespace Tests\Feature;

use App\Models\AdminLog;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBulkActionTest extends TestCase
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
     * Test unauthenticated user cannot perform bulk action.
     */
    public function test_unauthenticated_user_cannot_perform_bulk_action(): void
    {
        $response = $this->postJson('/api/admin/products/bulk', [
            'action' => 'delete',
            'ids' => [1, 2],
        ]);

        $response->assertUnauthorized();
    }

    /**
     * Test non-admin user is forbidden from bulk action.
     */
    public function test_non_admin_cannot_perform_bulk_action(): void
    {
        $customer = $this->createCustomer();
        $token = $customer->createToken('token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/products/bulk', [
            'action' => 'delete',
            'ids' => [1, 2],
        ]);

        $response->assertForbidden();
    }

    /**
     * Test validation error when missing action or IDs.
     */
    public function test_bulk_action_validation_fails_on_invalid_payload(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/products/bulk', [
            'action' => 'invalid_action',
            'ids' => [],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['action', 'ids']);
    }

    /**
     * Test bulk activate and deactivate products.
     */
    public function test_bulk_activate_and_deactivate_products(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $products = Product::factory()->count(3)->create(['is_featured' => false]);
        $ids = $products->pluck('id')->toArray();

        // Bulk activate
        $response = $this->withToken($token)->postJson('/api/admin/products/bulk', [
            'action' => 'activate',
            'ids' => $ids,
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'count_modified' => 3,
                'count_ignored' => 0,
            ],
        ]);

        foreach ($ids as $id) {
            $this->assertDatabaseHas('products', [
                'id' => $id,
                'is_featured' => true,
            ]);
        }

        // Verify AdminLog was generated
        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_ACTIVATE,
            'resource' => AdminLog::RESOURCE_PRODUCT,
        ]);

        // Bulk deactivate
        $deactivateResponse = $this->withToken($token)->postJson('/api/admin/products/bulk', [
            'action' => 'deactivate',
            'ids' => $ids,
        ]);

        $deactivateResponse->assertOk();
        foreach ($ids as $id) {
            $this->assertDatabaseHas('products', [
                'id' => $id,
                'is_featured' => false,
            ]);
        }
    }

    /**
     * Test bulk delete products.
     */
    public function test_bulk_delete_products(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $products = Product::factory()->count(2)->create();
        $ids = $products->pluck('id')->toArray();

        $response = $this->withToken($token)->postJson('/api/admin/products/bulk', [
            'action' => 'delete',
            'ids' => $ids,
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'count_modified' => 2,
                'count_ignored' => 0,
            ],
        ]);

        foreach ($ids as $id) {
            $this->assertDatabaseMissing('products', ['id' => $id]);
        }
    }

    /**
     * Test bulk approve and reject reviews.
     */
    public function test_bulk_approve_and_reject_reviews(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $product = Product::factory()->create();
        $reviews = Review::factory()->count(2)->create(['product_id' => $product->id, 'is_approved' => false]);
        $ids = $reviews->pluck('id')->toArray();

        $response = $this->withToken($token)->postJson('/api/admin/reviews/bulk', [
            'action' => 'approve',
            'ids' => $ids,
        ]);

        $response->assertOk();
        foreach ($ids as $id) {
            $this->assertDatabaseHas('reviews', ['id' => $id, 'is_approved' => true]);
        }
    }

    /**
     * Test bulk mark read for contacts.
     */
    public function test_bulk_mark_read_contacts(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $contacts = Contact::factory()->count(2)->create(['is_read' => false]);
        $ids = $contacts->pluck('id')->toArray();

        $response = $this->withToken($token)->postJson('/api/admin/contacts/bulk', [
            'action' => 'mark_read',
            'ids' => $ids,
        ]);

        $response->assertOk();
        foreach ($ids as $id) {
            $this->assertDatabaseHas('contacts', ['id' => $id, 'is_read' => true]);
        }
    }

    /**
     * Test bulk status update for orders.
     */
    public function test_bulk_status_update_orders(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $orders = Order::factory()->count(2)->create(['status' => Order::STATUS_PENDING]);
        $ids = $orders->pluck('id')->toArray();

        $response = $this->withToken($token)->postJson('/api/admin/orders/bulk', [
            'action' => 'status_update',
            'ids' => $ids,
            'params' => ['status' => Order::STATUS_SHIPPED],
        ]);

        $response->assertOk();
        foreach ($ids as $id) {
            $this->assertDatabaseHas('orders', ['id' => $id, 'status' => Order::STATUS_SHIPPED]);
        }
    }
}
