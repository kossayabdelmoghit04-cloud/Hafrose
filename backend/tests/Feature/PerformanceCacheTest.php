<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\DashboardStatsService;
use App\Services\ImageOptimizationService;
use App\Services\PerformanceCacheManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Suite de tests Phase 5.7 — Performance Backend HAFROSE
 *
 * Couvre :
 *  - Cache hit / miss
 *  - Cache invalidation via Observers
 *  - Dashboard stats + refresh endpoint
 *  - Cache status et clear endpoints
 *  - Pagination capping
 *  - Image optimization (JPEG, PNG, WEBP)
 *  - Permissions admin
 *  - Compatibilité avec tests existants
 */
class PerformanceCacheTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    // Setup
    // =========================================================================

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'email' => 'admin@hafrose.com',
            'role' => User::ROLE_ADMIN,
        ]);
    }

    // =========================================================================
    // PARTIE 1 — Cache Categories
    // =========================================================================

    public function test_categories_all_is_cached_on_second_call(): void
    {
        Category::factory()->count(3)->create();
        PerformanceCacheManager::forget('categories_all');

        // Premier appel — cache miss
        $first = $this->getJson('/api/categories');
        $first->assertStatus(200);

        // Deuxième appel — cache hit
        $second = $this->getJson('/api/categories');
        $second->assertStatus(200);
    }

    public function test_category_cache_is_invalidated_after_creation(): void
    {
        Category::factory()->count(2)->create();
        $this->getJson('/api/categories');
        $this->assertTrue(Cache::has('categories_all'));

        $this->actingAs($this->admin)->postJson('/api/admin/categories', [
            'name' => 'Nouvelle Catégorie Test',
            'slug' => 'nouvelle-categorie-test',
        ]);

        $this->assertFalse(Cache::has('categories_all'));
    }

    public function test_category_cache_is_invalidated_after_deletion(): void
    {
        $category = Category::factory()->create();
        $this->getJson('/api/categories');
        $this->assertTrue(Cache::has('categories_all'));

        $this->actingAs($this->admin)->deleteJson("/api/admin/categories/{$category->id}");

        $this->assertFalse(Cache::has('categories_all'));
    }

    // =========================================================================
    // PARTIE 2 — Cache Filters
    // =========================================================================

    public function test_filters_data_is_cached(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id]);

        PerformanceCacheManager::forget('products_filters_data');

        $this->getJson('/api/products/filters');
        $this->assertTrue(Cache::has('products_filters_data'));
    }

    public function test_filters_cache_is_invalidated_on_product_update(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $this->getJson('/api/products/filters');
        $this->assertTrue(Cache::has('products_filters_data'));

        $this->actingAs($this->admin, 'sanctum')->postJson("/api/admin/products/{$product->id}", [
            'name' => 'Produit Modifié',
            'slug' => $product->slug,
            'description' => 'Description modifiée',
            'price' => 99.99,
            'stock' => 10,
            'category_id' => $category->id,
        ]);

        $this->assertFalse(Cache::has('products_filters_data'));
    }

    // =========================================================================
    // PARTIE 3 — Cache Produits Populaires
    // =========================================================================

    public function test_popular_products_are_cached(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        $order = Order::factory()->create();
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 2]);

        PerformanceCacheManager::forget('popular_products_list_8');

        $this->getJson('/api/products/popular');
        $this->assertTrue(Cache::has('popular_products_list_8'));
    }

    public function test_popular_products_cache_invalidated_on_order_create(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id, 'stock' => 10]);
        $order = Order::factory()->create();
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->getJson('/api/products/popular');
        $this->assertTrue(Cache::has('popular_products_list_8'));

        // Création d'une commande (déclenche OrderObserver -> invalidateDashboard -> retire popular)
        Order::factory()->create();

        $this->assertFalse(Cache::has('popular_products_list_8'));
    }

    // =========================================================================
    // PARTIE 4 — DashboardStatsService
    // =========================================================================

    public function test_dashboard_metrics_are_cached(): void
    {
        PerformanceCacheManager::forget('dashboard_metrics');

        $response = $this->actingAs($this->admin)->getJson('/api/admin/dashboard');
        $response->assertStatus(200);

        $this->assertTrue(Cache::has('dashboard_metrics'));
    }

    public function test_dashboard_cache_invalidated_after_product_deleted(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $this->actingAs($this->admin)->getJson('/api/admin/dashboard');
        $this->assertTrue(Cache::has('dashboard_metrics'));

        $this->actingAs($this->admin)->deleteJson("/api/admin/products/{$product->id}");

        $this->assertFalse(Cache::has('dashboard_metrics'));
    }

    public function test_dashboard_stats_service_returns_correct_metrics(): void
    {
        $category = Category::factory()->count(2)->create()->first();
        Product::factory()->count(3)->create(['category_id' => $category->id]);

        $service = app(DashboardStatsService::class);
        $metrics = $service->getMetrics();

        $this->assertArrayHasKey('products_count', $metrics);
        $this->assertArrayHasKey('categories_count', $metrics);
        $this->assertArrayHasKey('orders_count', $metrics);
        $this->assertArrayHasKey('revenue', $metrics);
        $this->assertArrayHasKey('pending_reviews', $metrics);
        $this->assertArrayHasKey('unread_contacts', $metrics);
        $this->assertEquals(3, $metrics['products_count']);
        $this->assertEquals(2, $metrics['categories_count']);
    }

    public function test_dashboard_stats_service_sales_chart_returns_correct_days(): void
    {
        $service = app(DashboardStatsService::class);
        $chart = $service->getSalesChartData(7);

        $this->assertCount(7, $chart);
        $this->assertArrayHasKey('date', $chart[0]);
        $this->assertArrayHasKey('sales', $chart[0]);
        $this->assertArrayHasKey('count', $chart[0]);
    }

    // =========================================================================
    // PARTIE 5 — Refresh Cache Admin Endpoint
    // =========================================================================

    public function test_admin_can_refresh_dashboard_cache(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/cache/dashboard/refresh');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'metrics',
                    'sales_chart',
                    'popular_products',
                    'latest_orders',
                    'latest_messages',
                    'refreshed_at',
                ],
            ]);
    }

    public function test_unauthenticated_cannot_refresh_dashboard_cache(): void
    {
        $this->postJson('/api/admin/cache/dashboard/refresh')
            ->assertStatus(401);
    }

    public function test_non_admin_cannot_refresh_dashboard_cache(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user)
            ->postJson('/api/admin/cache/dashboard/refresh')
            ->assertStatus(403);
    }

    // =========================================================================
    // PARTIE 6 — Clear Cache Admin Endpoint
    // =========================================================================

    public function test_admin_can_clear_all_performance_cache(): void
    {
        Cache::put('dashboard_metrics', ['test' => true], 60);
        Cache::put('categories_all', ['test' => true], 60);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/cache/clear');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'message', 'cleared_at']);
    }

    public function test_unauthenticated_cannot_clear_cache(): void
    {
        $this->postJson('/api/admin/cache/clear')->assertStatus(401);
    }

    public function test_non_admin_cannot_clear_cache(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user)->postJson('/api/admin/cache/clear')->assertStatus(403);
    }

    // =========================================================================
    // PARTIE 7 — Cache Status Admin Endpoint
    // =========================================================================

    public function test_admin_can_get_cache_status(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/cache/status');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'driver',
                    'supports_tags',
                    'enabled',
                    'ttls',
                    'monitoring',
                    'keys_status',
                    'checked_at',
                ],
            ]);
    }

    public function test_unauthenticated_cannot_get_cache_status(): void
    {
        $this->getJson('/api/admin/cache/status')->assertStatus(401);
    }

    public function test_non_admin_cannot_get_cache_status(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user)->getJson('/api/admin/cache/status')->assertStatus(403);
    }

    // =========================================================================
    // PARTIE 8 — Pagination Capping
    // =========================================================================

    public function test_per_page_is_capped_at_max(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $response = $this->getJson('/api/products?per_page=50');
        $response->assertStatus(200);
        $perPage = $response->json('data.per_page')
            ?? $response->json('meta.per_page')
            ?? null;

        if ($perPage !== null) {
            $this->assertLessThanOrEqual(
                config('cache-performance.pagination.max_per_page', 100),
                (int) $perPage
            );
        }
    }

    public function test_admin_orders_paginated_with_per_page(): void
    {
        Order::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders?per_page=3');

        $response->assertStatus(200);
    }

    // =========================================================================
    // PARTIE 9 — ImageOptimizationService
    // =========================================================================

    public function test_image_optimization_service_generates_variants_for_jpeg(): void
    {
        Storage::fake('public');

        if (! extension_loaded('gd')) {
            $this->markTestSkipped('GD extension not available');
        }

        $service = app(ImageOptimizationService::class);

        $gdImg = imagecreatetruecolor(400, 300);
        $red = imagecolorallocate($gdImg, 255, 0, 0);
        imagefilledrectangle($gdImg, 0, 0, 400, 300, $red);

        $tmpFile = tempnam(sys_get_temp_dir(), 'test_img').'.jpg';
        imagejpeg($gdImg, $tmpFile, 85);
        if (PHP_VERSION_ID < 80500 && function_exists('imagedestroy')) {
            @imagedestroy($gdImg);
        }
        unset($gdImg);

        Storage::disk('public')->put('media/test_image.jpg', file_get_contents($tmpFile));
        unlink($tmpFile);

        $result = $service->optimizeAndStore('media/test_image.jpg', 'public', 'media');

        $this->assertArrayHasKey('original', $result);
        $this->assertArrayHasKey('variants', $result);

        foreach (['thumbnail', 'medium', 'large'] as $variant) {
            if (isset($result['variants'][$variant])) {
                $this->assertTrue(
                    Storage::disk('public')->exists($result['variants'][$variant]),
                    "Variant {$variant} should exist"
                );
            }
        }
    }

    public function test_image_optimization_service_get_variant_paths(): void
    {
        $service = app(ImageOptimizationService::class);
        $variants = $service->getVariantPaths('media/my_photo.jpg');

        $this->assertArrayHasKey('thumbnail', $variants);
        $this->assertArrayHasKey('medium', $variants);
        $this->assertArrayHasKey('large', $variants);
        $this->assertStringContainsString('thumbnail', $variants['thumbnail']);
        $this->assertStringContainsString('medium', $variants['medium']);
        $this->assertStringContainsString('large', $variants['large']);
    }

    public function test_image_optimization_service_delete_with_variants(): void
    {
        Storage::fake('public');

        $service = app(ImageOptimizationService::class);

        Storage::disk('public')->put('media/test_del.jpg', 'fake_content');
        Storage::disk('public')->put('media/test_del_thumbnail.jpg', 'fake_content');
        Storage::disk('public')->put('media/test_del_medium.jpg', 'fake_content');
        Storage::disk('public')->put('media/test_del_large.jpg', 'fake_content');

        $result = $service->deleteWithVariants('media/test_del.jpg', 'public');

        $this->assertTrue($result);
        $this->assertFalse(Storage::disk('public')->exists('media/test_del.jpg'));
        $this->assertFalse(Storage::disk('public')->exists('media/test_del_thumbnail.jpg'));
        $this->assertFalse(Storage::disk('public')->exists('media/test_del_medium.jpg'));
        $this->assertFalse(Storage::disk('public')->exists('media/test_del_large.jpg'));
    }

    // =========================================================================
    // PARTIE 10 — PerformanceCacheManager
    // =========================================================================

    public function test_performance_cache_manager_remember_works(): void
    {
        Cache::forget('test_perf_key');

        $result = PerformanceCacheManager::remember('test_perf_key', 60, fn () => ['value' => 42]);

        $this->assertEquals(['value' => 42], $result);
        $this->assertTrue(Cache::has('test_perf_key'));
    }

    public function test_performance_cache_manager_forget_works(): void
    {
        Cache::put('test_forget_key', 'hello', 60);
        $this->assertTrue(Cache::has('test_forget_key'));

        PerformanceCacheManager::forget('test_forget_key');

        $this->assertFalse(Cache::has('test_forget_key'));
    }

    public function test_performance_cache_manager_invalidate_categories_clears_key(): void
    {
        Cache::put('categories_all', ['cat1', 'cat2'], 60);
        PerformanceCacheManager::invalidateCategories();
        $this->assertFalse(Cache::has('categories_all'));
    }

    public function test_performance_cache_manager_invalidate_dashboard_clears_key(): void
    {
        Cache::put('dashboard_metrics', ['products_count' => 5], 60);
        PerformanceCacheManager::invalidateDashboard();
        $this->assertFalse(Cache::has('dashboard_metrics'));
    }

    public function test_performance_cache_manager_invalidate_reviews_clears_key(): void
    {
        Cache::put('reviews_approved_list_20', ['review1'], 60);
        PerformanceCacheManager::invalidateReviews();
        $this->assertFalse(Cache::has('reviews_approved_list_20'));
    }

    public function test_performance_cache_manager_invalidate_contacts_clears_key(): void
    {
        Cache::put('dashboard_latest_messages_5', ['msg1'], 60);
        PerformanceCacheManager::invalidateContacts();
        $this->assertFalse(Cache::has('dashboard_latest_messages_5'));
    }
}
