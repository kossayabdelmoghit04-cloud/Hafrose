<?php

namespace Tests\Feature;

use App\Exceptions\InsufficientStockException;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class MC06C1DynamicTest extends TestCase
{
    use DatabaseTransactions;

    protected OrderService $orderService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->orderService = app(OrderService::class);
    }

    private function createTestCategory(array $attributes = []): Category
    {
        $unique = Str::random(10);

        return Category::create(array_merge([
            'name' => 'Cat '.$unique,
            'slug' => 'cat-'.$unique,
            'description' => 'Test description '.$unique,
            'image' => 'categories/test.jpg',
        ], $attributes));
    }

    private function createTestProduct(int $categoryId, array $attributes = []): Product
    {
        $unique = Str::random(10);

        return Product::create(array_merge([
            'category_id' => $categoryId,
            'name' => 'Prod '.$unique,
            'slug' => 'prod-'.$unique,
            'description' => 'Test description '.$unique,
            'short_description' => 'Short desc '.$unique,
            'price' => 100.00,
            'stock' => 10,
            'brand' => 'Hafrose',
            'image' => 'products/default.jpg',
            'is_featured' => false,
        ], $attributes));
    }

    /**
     * Test 1: Dynamic proof of stock decrement and payment_status default on normal order creation.
     */
    public function test_stock_decrements_correctly_on_order_creation(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'price' => 100.00,
            'sale_price' => null,
            'stock' => 10,
        ]);

        $orderData = [
            'customer' => 'Jean Dupont',
            'phone' => '0601020304',
            'address' => '10 rue de la Paix',
            'city' => 'Paris',
            'postal_code' => '75001',
            'country' => 'France',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ];

        $order = $this->orderService->createOrder($orderData);

        $this->assertEquals(8, $product->fresh()->stock, 'Stock must decrement from 10 to 8');
        $this->assertEquals(Order::STATUS_PENDING, $order->status);
        $this->assertEquals(Order::PAYMENT_STATUS_PENDING, $order->payment_status);
        $this->assertEquals('pending', $order->payment_status);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'pending',
            'status' => Order::STATUS_PENDING,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 100.00,
        ]);
    }

    /**
     * Test 2: Dynamic proof of stock protection when stock is insufficient.
     */
    public function test_insufficient_stock_raises_exception_and_leaves_stock_untouched(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'stock' => 1,
            'price' => 50.00,
        ]);

        $orderData = [
            'customer' => 'Alice Martin',
            'phone' => '0601020305',
            'address' => '20 avenue Montaigne',
            'city' => 'Paris',
            'postal_code' => '75008',
            'country' => 'France',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ];

        $initialOrdersCount = Order::count();
        $initialItemsCount = OrderItem::count();

        $this->expectException(InsufficientStockException::class);

        try {
            $this->orderService->createOrder($orderData);
        } finally {
            $this->assertEquals(1, $product->fresh()->stock, 'Stock must remain 1');
            $this->assertEquals($initialOrdersCount, Order::count(), 'Zero orders must be created');
            $this->assertEquals($initialItemsCount, OrderItem::count(), 'Zero order items must be created');
        }
    }

    /**
     * Test 3: Dynamic proof of multi-product transaction rollback.
     */
    public function test_multi_product_transaction_rollback_when_one_item_fails(): void
    {
        $category = $this->createTestCategory();
        $productA = $this->createTestProduct($category->id, [
            'name' => 'Produit A',
            'stock' => 10,
            'price' => 100.00,
        ]);
        $productB = $this->createTestProduct($category->id, [
            'name' => 'Produit B',
            'stock' => 1,
            'price' => 50.00,
        ]);

        $orderData = [
            'customer' => 'Bob Smith',
            'phone' => '0601020306',
            'address' => '5 boulevard Haussmann',
            'city' => 'Paris',
            'postal_code' => '75009',
            'country' => 'France',
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 2],
                ['product_id' => $productB->id, 'quantity' => 5],
            ],
        ];

        $initialOrdersCount = Order::count();
        $initialItemsCount = OrderItem::count();

        $this->expectException(InsufficientStockException::class);

        try {
            $this->orderService->createOrder($orderData);
        } finally {
            $this->assertEquals(10, $productA->fresh()->stock, 'Product A stock must be rolled back');
            $this->assertEquals(1, $productB->fresh()->stock, 'Product B stock must remain unchanged');
            $this->assertEquals($initialOrdersCount, Order::count(), 'Zero orders must be created');
            $this->assertEquals($initialItemsCount, OrderItem::count(), 'Zero order items must be created');
        }
    }

    /**
     * Test 4: Dynamic proof of stock restoration on order cancellation.
     */
    public function test_order_cancellation_restores_stock(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'stock' => 10,
            'price' => 60.00,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'Claire Delacour',
            'phone' => '0601020307',
            'address' => '12 rue Royale',
            'city' => 'Paris',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ]);

        $this->assertEquals(7, $product->fresh()->stock);

        $this->orderService->updateOrderStatus($order, Order::STATUS_CANCELLED);

        $this->assertEquals(10, $product->fresh()->stock, 'Stock must be restored to 10 on cancellation');
        $this->assertEquals(Order::STATUS_CANCELLED, $order->fresh()->status);
    }

    /**
     * Test 5: Dynamic proof of cancellation idempotency (no double restoration).
     */
    public function test_order_cancellation_is_idempotent(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'stock' => 10,
            'price' => 60.00,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'Claire Delacour',
            'phone' => '0601020307',
            'address' => '12 rue Royale',
            'city' => 'Paris',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 4],
            ],
        ]);

        $this->assertEquals(6, $product->fresh()->stock);

        // First cancellation
        $this->orderService->updateOrderStatus($order, Order::STATUS_CANCELLED);
        $this->assertEquals(10, $product->fresh()->stock);

        // Second cancellation (same status)
        $this->orderService->updateOrderStatus($order->fresh(), Order::STATUS_CANCELLED);
        $this->assertEquals(10, $product->fresh()->stock, 'Idempotent cancellation must not restore stock twice');
    }

    /**
     * Test 6: Dynamic proof of reactivation decrements stock.
     */
    public function test_order_reactivation_decrements_stock(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'stock' => 10,
            'price' => 80.00,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'David Moreau',
            'phone' => '0601020308',
            'address' => '8 rue de Sèvres',
            'city' => 'Paris',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ]);

        $this->assertEquals(7, $product->fresh()->stock);

        // Cancel order -> restores stock to 10
        $this->orderService->updateOrderStatus($order, Order::STATUS_CANCELLED);
        $this->assertEquals(10, $product->fresh()->stock);

        // Reactivate order -> decrements stock to 7
        $this->orderService->updateOrderStatus($order->fresh(), Order::STATUS_PENDING);
        $this->assertEquals(7, $product->fresh()->stock);
        $this->assertEquals(Order::STATUS_PENDING, $order->fresh()->status);
    }

    /**
     * Test 7: Dynamic proof of reactivation failure when stock is insufficient.
     */
    public function test_order_reactivation_fails_when_stock_insufficient(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'stock' => 10,
            'price' => 80.00,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'David Moreau',
            'phone' => '0601020308',
            'address' => '8 rue de Sèvres',
            'city' => 'Paris',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 5],
            ],
        ]);

        $this->assertEquals(5, $product->fresh()->stock);

        // Cancel order -> restores stock to 10
        $this->orderService->updateOrderStatus($order, Order::STATUS_CANCELLED);
        $this->assertEquals(10, $product->fresh()->stock);

        // Stock reduced externally
        $product->update(['stock' => 2]);

        $this->expectException(InsufficientStockException::class);

        try {
            $this->orderService->updateOrderStatus($order->fresh(), Order::STATUS_PENDING);
        } finally {
            $this->assertEquals(2, $product->fresh()->stock, 'Stock must remain 2');
            $this->assertEquals(Order::STATUS_CANCELLED, $order->fresh()->status, 'Order status must remain cancelled');
        }
    }

    /**
     * Test 8: Dynamic proof of historical price integrity.
     */
    public function test_historical_price_integrity_on_product_price_mutation(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'price' => 150.00,
            'sale_price' => null,
            'stock' => 10,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'Emma Watson',
            'phone' => '0601020309',
            'address' => '1 place Vendôme',
            'city' => 'Paris',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ]);

        $orderItem = $order->orderItems()->first();
        $this->assertEquals('150.00', (string) $orderItem->unit_price);
        $this->assertEquals('350.00', (string) $order->fresh()->total_price);

        // Product price changes in catalog
        $product->update(['price' => 250.00]);

        $this->assertEquals('150.00', (string) $orderItem->fresh()->unit_price, 'Historical unit_price must not change');
        $this->assertEquals('350.00', (string) $order->fresh()->total_price, 'Historical total_price must not change');
    }

    /**
     * Test 9: Dynamic proof of deleted product preservation (ON DELETE SET NULL).
     */
    public function test_product_deletion_sets_order_item_product_id_to_null_and_preserves_order(): void
    {
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, [
            'name' => 'Collier Héritage',
            'price' => 500.00,
            'stock' => 5,
        ]);

        $order = $this->orderService->createOrder([
            'customer' => 'François Blanc',
            'phone' => '0601020310',
            'address' => '3 rue de Rivoli',
            'city' => 'Paris',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $orderItemId = $order->orderItems()->first()->id;

        // Delete the product
        $product->delete();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        $this->assertDatabaseHas('orders', ['id' => $order->id]);
        $this->assertDatabaseHas('order_items', [
            'id' => $orderItemId,
            'order_id' => $order->id,
            'product_id' => null,
            'unit_price' => 500.00,
        ]);
    }

    /**
     * Test 10: Dynamic proof of payment_status default = 'pending' in DB schema and in Service.
     */
    public function test_payment_status_db_default_and_service_default_are_pending(): void
    {
        // 1. Raw DB insert without specifying payment_status
        $rawOrderId = DB::table('orders')->insertGetId([
            'customer_name' => 'Raw Customer',
            'phone' => '0600000000',
            'address' => 'Test Street',
            'city' => 'Paris',
            'total_price' => 100.00,
            'status' => Order::STATUS_PENDING,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $rawOrder = DB::table('orders')->where('id', $rawOrderId)->first();
        $this->assertEquals('pending', $rawOrder->payment_status, 'Database DEFAULT must be pending');

        // 2. Service creation
        $category = $this->createTestCategory();
        $product = $this->createTestProduct($category->id, ['stock' => 5]);
        $serviceOrder = $this->orderService->createOrder([
            'customer' => 'Service Customer',
            'phone' => '0600000001',
            'address' => 'Service Street',
            'city' => 'Lyon',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $this->assertEquals('pending', $serviceOrder->payment_status);
        $this->assertEquals('pending', $serviceOrder->fresh()->payment_status);
    }
}
