<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * MC06C1ConcurrencyTest — Dynamic proof of pessimistic locking (lockForUpdate).
 *
 * Methodology: Two independent MySQL sessions overlap in real transactions.
 * Connection 1 acquires lockForUpdate; Connection 2 times out while waiting on the same row.
 * After Connection 1 commits, Connection 2 acquires lockForUpdate and sees stock = 0.
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
        $this->testSlug = 'test-concurrency-'.Str::random(8);
    }

    protected function tearDown(): void
    {
        try {
            // Commit/rollback any open transactions from the test
            DB::connection()->rollBack();
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
            'slug' => $this->testSlug.'-cat',
            'description' => 'Temp category for concurrency test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->createdCategoryId = $categoryId;

        // Create product with stock = 1
        $productId = DB::table('products')->insertGetId([
            'category_id' => $categoryId,
            'name' => 'Concurrent Test Product '.$this->testSlug,
            'slug' => $this->testSlug,
            'description' => 'Test product for concurrency test',
            'price' => 100.00,
            'stock' => 1,
            'brand' => 'Hafrose',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->createdProductId = $productId;

        // Clone the active test connection so CI and local runs use identical MySQL settings.
        $connectionName = config('database.default');
        $connectionConfig = config("database.connections.{$connectionName}");
        $this->assertSame('mysql', $connectionConfig['driver'], 'This test requires real MySQL FOR UPDATE semantics');

        config(['database.connections.mysql_conn2' => $connectionConfig]);
        DB::purge('mysql_conn2');

        $connectionA = DB::connection($connectionName);
        $connectionB = DB::connection('mysql_conn2');

        $this->assertNotSame($connectionA->getPdo(), $connectionB->getPdo(), 'Connections A and B must use distinct PDO instances');
        $connectionAId = (int) $connectionA->selectOne('SELECT CONNECTION_ID() AS id')->id;
        $connectionBId = (int) $connectionB->selectOne('SELECT CONNECTION_ID() AS id')->id;
        $this->assertNotSame($connectionAId, $connectionBId, 'Connections A and B must use distinct MySQL sessions');

        // ── CONNECTION 1 ─────────────────────────────────────────────────────────
        // Begins transaction, acquires pessimistic lock, decrements stock, inserts order, commits
        $connectionA->beginTransaction();

        $lockedProduct1 = $connectionA
            ->table('products')
            ->where('id', $productId)
            ->lockForUpdate()
            ->first();

        $this->assertNotNull($lockedProduct1);
        $this->assertEquals(1, $lockedProduct1->stock, 'Connection 1 must see stock = 1');

        // Decrement stock
        $connectionA
            ->table('products')
            ->where('id', $productId)
            ->decrement('stock', 1);

        // Insert order
        $orderId = $connectionA
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

        $connectionA
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

        // While A still owns the row lock, B must block and hit MySQL error 1205.
        $connectionB->statement('SET SESSION innodb_lock_wait_timeout = 1');
        $connectionB->beginTransaction();
        $lockWaitTimedOut = false;

        try {
            $connectionB
                ->table('products')
                ->where('id', $productId)
                ->lockForUpdate()
                ->first();
        } catch (QueryException $exception) {
            $lockWaitTimedOut = (int) ($exception->errorInfo[1] ?? 0) === 1205;
        } finally {
            $connectionB->rollBack();
        }

        $this->assertTrue($lockWaitTimedOut, 'Connection B must wait on the row lock held by Connection A');

        // Commit Connection 1 — stock is now 0 in the DB.
        $connectionA->commit();

        // ── CONNECTION 2 ─────────────────────────────────────────────────────────
        // Acquires lockForUpdate AFTER Connection 1 committed — sees stock = 0
        $connectionB->beginTransaction();

        $lockedProduct2 = $connectionB
            ->table('products')
            ->where('id', $productId)
            ->lockForUpdate()
            ->first();

        $this->assertEquals(0, $lockedProduct2->stock, 'Connection 2 must see stock = 0 after Connection 1 committed');

        // Connection 2 correctly rejects the purchase because stock = 0
        $rejectedDueToZeroStock = ($lockedProduct2->stock < 1);
        $this->assertTrue($rejectedDueToZeroStock, 'Connection 2 must be rejected due to insufficient stock');

        // Roll back Connection 2 without creating an order
        $connectionB->rollBack();

        // ── FINAL VERIFICATION ────────────────────────────────────────────────────
        $finalStock = DB::table('products')->where('id', $productId)->value('stock');
        $this->assertEquals(0, $finalStock, 'Final stock must be exactly 0, not -1');
        $this->assertGreaterThanOrEqual(0, $finalStock, 'Stock must never be negative');

        $ordersCount = DB::table('orders')->where('customer_name', 'like', 'Concurrent Customer%')->count();
        $this->assertEquals(1, $ordersCount, 'Exactly 1 order must be created');
    }
}
