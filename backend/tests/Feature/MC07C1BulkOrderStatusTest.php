<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1BulkOrderStatusTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        return $admin->createToken('admin-token')->plainTextToken;
    }

    private function orderWithReservedStock(int $quantity = 2): array
    {
        $product = Product::factory()->create(['stock' => 8, 'price' => 100]);
        $order = Order::factory()->create(['status' => Order::STATUS_PENDING]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => 100,
        ]);

        return [$order, $product];
    }

    public function test_bulk_cancellation_restores_stock_exactly_once(): void
    {
        [$order, $product] = $this->orderWithReservedStock();
        $token = $this->adminToken();

        $payload = ['action' => 'archive', 'ids' => [$order->id]];
        $this->withToken($token)->postJson('/api/admin/orders/bulk', $payload)->assertOk();
        $this->assertSame(10, $product->fresh()->stock);
        $this->assertSame(Order::STATUS_CANCELLED, $order->fresh()->status);

        $this->withToken($token)->postJson('/api/admin/orders/bulk', $payload)->assertOk();
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_invalid_bulk_status_is_rejected_before_mutation(): void
    {
        [$order, $product] = $this->orderWithReservedStock();

        $this->withToken($this->adminToken())->postJson('/api/admin/orders/bulk', [
            'action' => 'status_update',
            'ids' => [$order->id],
            'params' => ['status' => 'arbitrary-status'],
        ])->assertUnprocessable()->assertJsonValidationErrors('params.status');

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->status);
        $this->assertSame(8, $product->fresh()->stock);
    }

    public function test_mixed_batch_returns_multistatus_and_reports_missing_order(): void
    {
        [$order, $product] = $this->orderWithReservedStock();

        $this->withToken($this->adminToken())->postJson('/api/admin/orders/bulk', [
            'action' => 'archive',
            'ids' => [$order->id, 999999],
        ])->assertStatus(207)
            ->assertJsonPath('data.count_modified', 1)
            ->assertJsonPath('data.count_ignored', 1)
            ->assertJsonCount(1, 'errors');

        $this->assertSame(10, $product->fresh()->stock);
    }
}
