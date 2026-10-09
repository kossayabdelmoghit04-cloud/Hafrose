<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MC07C2ShippingThresholdTest extends TestCase
{
    use RefreshDatabase;

    public function test_backend_applies_the_official_free_shipping_threshold_semantics(): void
    {
        $cases = [
            'zero threshold disables free shipping' => [50, 0, 350, 50],
            'subtotal below threshold is paid' => [50, 500, 350, 50],
            'subtotal at threshold is free' => [50, 500, 500, 0],
            'subtotal above threshold is free' => [50, 500, 600, 0],
            'zero configured shipping fee stays free' => [0, 500, 350, 0],
        ];

        foreach ($cases as $name => [$fee, $threshold, $subtotal, $expectedShipping]) {
            Setting::updateOrCreate(['key' => 'shipping_fee'], ['value' => (string) $fee]);
            Setting::updateOrCreate(
                ['key' => 'free_shipping_threshold'],
                ['value' => (string) $threshold]
            );
            Cache::forget('site_settings');

            $product = Product::factory()->create([
                'price' => $subtotal,
                'stock' => 2,
            ]);

            $response = $this->postJson('/api/orders', [
                'customer' => 'Client Shipping Test',
                'phone' => '0612345678',
                'address' => '1 rue des Tests',
                'city' => 'Paris',
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
            ]);

            $response->assertCreated();
            $this->assertSame(
                $expectedShipping,
                $response->json('data.shipping_amount'),
                $name
            );
        }
    }
}
