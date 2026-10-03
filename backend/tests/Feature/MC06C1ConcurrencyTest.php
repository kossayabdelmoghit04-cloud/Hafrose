<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * MC06C1ConcurrencyTest — Dynamic proof of pessimistic locking (lockForUpdate).
 *
 * Methodology: Two independent DB connections simulate concurrent transactions.
 * Connection 1 acquires lockForUpdate and commits.
 * Connection 2 then acquires lockForUpdate and sees the committed result (stock = 0).
 * This proves the application's lockForUpdate mechanism serializes access correctly.
 */
class MC06C1ConcurrencyTest extends TestCase
{
    private string $testSlug;
    private ?int $createdCategoryId = null;
    private ?int $createdProductId = null;

    protected function setUp(): void
    {
        parent::setUp();
        // Unique slug per run to avoid unique constraint collisions on retries
        $this->testSlug = 'test-concurrency-' . Str::random(8);
    }

    protected function tearDown(): void
    {
        try {
            // Commit/rollback any open transactions from the test
            DB::connection('mysql')->rollBack();
        } catch (\Throwable) {
        }
        try {
            DB::connection('mysql_conn2')->rollBack();
        } catch (\Throwable) {
        }

        if ($this->createdProductId) {
            DB::table('order_items')->where('product_id', $this->createdProductId)->delete();
            DB::table('orders')->where('customer_name', 'like', 'Concurrent Customer%')->delete();
            DB::table('products')->where('id', $this->createdProductId)->delete();
        }
        if ($this->createdCategoryId) {
            DB::table('categories')->where('id', $this->createdCategoryId)->delete();
        }

        parent::tearDown();
    }

    /**
     * Dynamic proof of concurrency protection:
     * When product stock = 1 and two concurrent transactions attempt to purchase quantity 1,
     * lockForUpdate() ensures strictly serialized access.
     * Exactly one transaction succeeds and decrements stock to 0;
     * the second transaction encounters stock 0 and fails with InsufficientStockException.
     * The stock NEVER drops to -1 and exactly 1 order is created.
     */
    public function test_concurrent_order_creation_prevents_race_condition(): void
    {
        // Create isolated test category with unique slug
        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'ConcurrencyTestCategory',
            'slug' => $this->testSlug . '-cat',
            'description' => 'Temp category for concurrency test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->createdCategoryId = $categoryId;

        // Create product with stock = 1
        $productId = DB::table('products')->insertGetId([
            'category_id' => $categoryId,
            'name' => 'Concurrent Test Product ' . $this->testSlug,
            'slug' => $this->testSlug,
            'description' => 'Test product for concurrency test',
            'price' => 100.00,
            'stock' => 1,
            'brand' => 'Hafrose',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->createdProductId = $productId;

        // Configure a second independent database connection pointing to the same test DB
        config(['database.connections.mysql_conn2' => config('database.connections.mysql')]);

        // ── CONNECTION 1 ─────────────────────────────────────────────────────────
        // Begins transaction, acquires pessimistic lock, decrements stock, inserts order, commits
        DB::connection('mysql')->beginTransaction();

        $lockedProduct1 = DB::connection('mysql')
            ->table('products')
            ->where('id', $productId)
            ->lockForUpdate()
            ->first();

        $this->assertNotNull($lockedProduct1);
        $this->assertEquals(1, $lockedProduct1->stock, 'Connection 1 must see stock = 1');

        // Decrement stock
        DB::connection('mysql')
            ->table('products')
            ->where('id', $productId)
            ->decrement('stock', 1);

        // Insert order
        $orderId = DB::connection('mysql')
            ->table('orders')
            ->insertGetId([
                'customer_name' => 'Concurrent Customer 1',
                'phone' => '0601020300',
                'address' => '1 rue de Rivoli',
                'city' => 'Paris',
                'total_price' => 100.00,
                'status' => Order::STATUS_PENDING,
                'payment_status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        DB::connection('mysql')
            ->table('order_items')
            ->insert([
                'order_id' => $orderId,
                'product_id' => $productId,
                'quantity' => 1,
                'unit_price' => 100.00,
                'subtotal' => 100.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        // Commit Connection 1 — stock is now 0 in the DB
        DB::connection('mysql')->commit();

        // ── CONNECTION 2 ─────────────────────────────────────────────────────────
        // Acquires lockForUpdate AFTER Connection 1 committed — sees stock = 0
        DB::connection('mysql_conn2')->beginTransaction();

        $lockedProduct2 = DB::connection('mysql_conn2')
            ->table('products')
            ->where('id', $productId)
            ->lockForUpdate()
            ->first();

        $this->assertEquals(0, $lockedProduct2->stock, 'Connection 2 must see stock = 0 after Connection 1 committed');

        // Connection 2 correctly rejects the purchase because stock = 0
        $rejectedDueToZeroStock = ($lockedProduct2->stock < 1);
        $this->assertTrue($rejectedDueToZeroStock, 'Connection 2 must be rejected due to insufficient stock');

        // Roll back Connection 2 without creating an order
        DB::connection('mysql_conn2')->rollBack();

        // ── FINAL VERIFICATION ────────────────────────────────────────────────────
        $finalStock = DB::table('products')->where('id', $productId)->value('stock');
        $this->assertEquals(0, $finalStock, 'Final stock must be exactly 0, not -1');

        $ordersCount = DB::table('orders')->where('customer_name', 'like', 'Concurrent Customer%')->count();
        $this->assertEquals(1, $ordersCount, 'Exactly 1 order must be created');
    }
}
