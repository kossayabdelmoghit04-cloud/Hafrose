<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function test_can_list_orders(): void
    {
        $token = $this->adminToken();
        Order::factory()->count(3)->create();

        $response = $this->withToken($token)->getJson('/api/admin/orders');

        $response->assertOk()
                 ->assertJsonStructure(['data' => [['id', 'customer_name', 'total_price', 'status']]]);
    }

    public function test_orders_can_be_filtered_by_status(): void
    {
        $token = $this->adminToken();
        Order::factory()->create(['status' => Order::STATUS_PENDING]);
        Order::factory()->create(['status' => Order::STATUS_SHIPPED]);

        $statusQuery = urlencode(Order::STATUS_PENDING);
        $response = $this->withToken($token)->getJson("/api/admin/orders?status={$statusQuery}");

        $response->assertOk();
        $orders = $response->json('data');
        $this->assertNotEmpty($orders);
        foreach ($orders as $order) {
            $this->assertEquals(Order::STATUS_PENDING, $order['status']);
        }
    }

    // ─── Show ─────────────────────────────────────────────────────────────────

    public function test_can_view_single_order(): void
    {
        $token = $this->adminToken();
        $order = Order::factory()->create();

        $response = $this->withToken($token)->getJson("/api/admin/orders/{$order->id}");

        $response->assertOk()
                 ->assertJsonFragment(['id' => $order->id]);
    }

    public function test_view_nonexistent_order_returns_404(): void
    {
        $token = $this->adminToken();

        $this->withToken($token)->getJson('/api/admin/orders/99999')->assertNotFound();
    }

    // ─── Update Status ────────────────────────────────────────────────────────

    public function test_can_update_order_status(): void
    {
        $token = $this->adminToken();
        $order = Order::factory()->create(['status' => Order::STATUS_PENDING]);

        $response = $this->withToken($token)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => Order::STATUS_CONFIRMED,
        ]);

        $response->assertOk()
                 ->assertJsonFragment(['status' => Order::STATUS_CONFIRMED]);

        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => Order::STATUS_CONFIRMED,
        ]);
    }

    public function test_update_status_rejects_invalid_status(): void
    {
        $token = $this->adminToken();
        $order = Order::factory()->create();

        $response = $this->withToken($token)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'invalid_status',
        ]);

        $response->assertUnprocessable();
    }

    public function test_cancelling_order_restores_stock(): void
    {
        $token   = $this->adminToken();
        $product = Product::factory()->create(['stock' => 10]);
        $order   = Order::factory()->hasOrderItems(1, [
            'product_id' => $product->id,
            'quantity'   => 3,
            'unit_price' => $product->price,
        ])->create(['status' => Order::STATUS_CONFIRMED]);

        $this->withToken($token)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => Order::STATUS_CANCELLED,
        ]);

        $this->assertDatabaseHas('products', [
            'id'    => $product->id,
            'stock' => 13, // 10 original + 3 restored
        ]);
    }

    // ─── PDF Export ───────────────────────────────────────────────────────────

    public function test_can_export_order_pdf(): void
    {
        $token = $this->adminToken();
        $order = Order::factory()->create();

        $response = $this->withToken($token)->getJson("/api/admin/orders/{$order->id}/pdf");

        // PDF endpoint returns a binary file response (200 with content-type PDF)
        $response->assertOk();
    }

    public function test_orders_require_authentication(): void
    {
        $this->getJson('/api/admin/orders')->assertUnauthorized();
    }
}
