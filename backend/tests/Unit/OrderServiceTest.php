<?php

namespace Tests\Unit;

use App\Exceptions\InsufficientStockException;
use App\Exceptions\ProductNotFoundException;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    protected OrderService $orderService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->orderService = app(OrderService::class);
    }

    public function test_create_order_throws_insufficient_stock_exception(): void
    {
        $product = Product::factory()->create([
            'name' => 'Sac Royal',
            'stock' => 1,
            'price' => 150.00,
        ]);

        $this->expectException(InsufficientStockException::class);

        try {
            $this->orderService->createOrder([
                'customer' => 'Client Test',
                'phone' => '0600000000',
                'address' => 'Rue Test',
                'city' => 'Casablanca',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 5,
                    ],
                ],
            ]);
        } catch (InsufficientStockException $e) {
            $this->assertEquals('Sac Royal', $e->productName);
            $this->assertEquals(1, $e->availableStock);
            $this->assertEquals(409, $e->getCode());
            throw $e;
        }
    }

    public function test_create_order_throws_product_not_found_exception(): void
    {
        $this->expectException(ProductNotFoundException::class);

        try {
            $this->orderService->createOrder([
                'customer' => 'Client Test',
                'phone' => '0600000000',
                'address' => 'Rue Test',
                'city' => 'Casablanca',
                'items' => [
                    [
                        'product_id' => 99999,
                        'quantity' => 1,
                    ],
                ],
            ]);
        } catch (ProductNotFoundException $e) {
            $this->assertEquals(99999, $e->productId);
            $this->assertEquals(404, $e->getCode());
            throw $e;
        }
    }

    public function test_create_order_successfully_decrements_stock(): void
    {
        $product = Product::factory()->create([
            'stock' => 10,
            'price' => 100.00,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'Client Test',
            'phone' => '0600000000',
            'address' => 'Rue Test',
            'city' => 'Casablanca',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 3,
                ],
            ],
        ]);

        $this->assertInstanceOf(Order::class, $order);
        $product->refresh();
        $this->assertEquals(7, $product->stock);
    }

    public function test_cancelling_order_restores_stock(): void
    {
        $product = Product::factory()->create([
            'stock' => 10,
            'price' => 100.00,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'Client Test',
            'phone' => '0600000000',
            'address' => 'Rue Test',
            'city' => 'Casablanca',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 4,
                ],
            ],
        ]);

        $product->refresh();
        $this->assertEquals(6, $product->stock);

        $this->orderService->updateOrderStatus($order, Order::STATUS_CANCELLED);

        $product->refresh();
        $this->assertEquals(10, $product->stock);
    }
}
