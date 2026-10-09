<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MC07C1CheckoutSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function payload(Product $product): array
    {
        return [
            'customer' => 'Client Security',
            'phone' => '0612345678',
            'address' => '1 rue des Tests',
            'city' => 'Paris',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ];
    }

    private function configureShipping(float $fee = 50, float $threshold = 1000): void
    {
        Setting::updateOrCreate(['key' => 'shipping_fee'], ['value' => (string) $fee]);
        Setting::updateOrCreate(['key' => 'free_shipping_threshold'], ['value' => (string) $threshold]);
        Cache::forget('site_settings');
    }

    public function test_client_supplied_shipping_amount_is_rejected_for_all_manipulated_values(): void
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

        foreach ([0, 123.45, -10, 999999999] as $shippingAmount) {
            $this->postJson('/api/orders', $this->payload($product) + ['shipping_amount' => $shippingAmount])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('shipping_amount');
        }

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_server_applies_configured_shipping_below_free_threshold(): void
    {
        $this->configureShipping(50, 1000);
        $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

        $this->postJson('/api/orders', $this->payload($product))
            ->assertCreated()
            ->assertJsonPath('data.subtotal_amount', 100)
            ->assertJsonPath('data.shipping_amount', 50)
            ->assertJsonPath('data.total_price', 150);
    }

    public function test_server_grants_free_shipping_at_configured_threshold(): void
    {
        $this->configureShipping(50, 1000);
        $product = Product::factory()->create(['stock' => 10, 'price' => 1000]);

        $this->postJson('/api/orders', $this->payload($product))
            ->assertCreated()
            ->assertJsonPath('data.subtotal_amount', 1000)
            ->assertJsonPath('data.shipping_amount', 0)
            ->assertJsonPath('data.total_price', 1000);
    }

    public function test_order_ignores_unvalidated_identity_status_and_financial_fields(): void
    {
        $this->configureShipping(50, 1000);
        $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

        $this->postJson('/api/orders', $this->payload($product) + [
            'user_id' => 999999,
            'status' => 'Livrée',
            'total_price' => 0.01,
            'total_amount' => 0.01,
            'price' => 0.01,
        ])->assertCreated()
            ->assertJsonPath('data.user_id', null)
            ->assertJsonPath('data.status', 'En attente')
            ->assertJsonPath('data.total_price', 150);
    }
}
