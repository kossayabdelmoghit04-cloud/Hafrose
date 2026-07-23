<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\MonitoringDashboardService;
use App\Services\ProductionLogService;
use App\Services\SystemHealthService;
use App\Services\SystemMetricsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SystemMonitoringTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles si nécessaires
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        // Utilisateur Admin
        $this->admin = User::factory()->create([
            'email' => 'admin_monitoring@hafrose.com',
            'role' => User::ROLE_ADMIN,
        ]);
        $this->admin->assignRole($adminRole);

        // Utilisateur Client normal
        $this->customer = User::factory()->create([
            'email' => 'customer_monitoring@hafrose.com',
            'role' => 'customer',
        ]);
        $this->customer->assignRole($customerRole);
    }

    // ─── 1. Endpoints & Permissions (401/403/200) ───────────────────────────

    public function test_unauthenticated_user_cannot_access_monitoring_endpoints(): void
    {
        $this->getJson('/api/admin/system/health')->assertStatus(401);
        $this->getJson('/api/admin/system/metrics')->assertStatus(401);
        $this->getJson('/api/admin/system/status')->assertStatus(401);
        $this->getJson('/api/admin/system/phpinfo')->assertStatus(401);
    }

    public function test_non_admin_customer_cannot_access_monitoring_endpoints(): void
    {
        $token = $this->customer->createToken('test')->plainTextToken;

        $headers = ['Authorization' => "Bearer {$token}"];

        $this->getJson('/api/admin/system/health', $headers)->assertStatus(403);
        $this->getJson('/api/admin/system/metrics', $headers)->assertStatus(403);
        $this->getJson('/api/admin/system/status', $headers)->assertStatus(403);
        $this->getJson('/api/admin/system/phpinfo', $headers)->assertStatus(403);
    }

    public function test_admin_can_access_health_endpoint(): void
    {
        $token = $this->admin->createToken('admin_test')->plainTextToken;

        $response = $this->getJson('/api/admin/system/health', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    'status',
                    'checks' => [
                        'database',
                        'cache',
                        'filesystem',
                        'queue',
                        'scheduler',
                        'php',
                        'server',
                        'application',
                    ],
                    'warnings',
                    'errors',
                ],
            ]);
    }

    public function test_admin_can_access_metrics_endpoint(): void
    {
        $token = $this->admin->createToken('admin_test')->plainTextToken;

        $response = $this->getJson('/api/admin/system/metrics', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'cpu',
                    'ram',
                    'disk',
                    'database',
                    'cache',
                    'filesystem',
                    'queue',
                    'scheduler',
                    'performance',
                ],
            ]);
    }

    public function test_admin_can_access_status_endpoint(): void
    {
        $token = $this->admin->createToken('admin_test')->plainTextToken;

        $response = $this->getJson('/api/admin/system/status', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'summary' => [
                        'status',
                        'active_alerts',
                        'php_version',
                        'laravel_version',
                        'environment',
                        'timestamp',
                    ],
                    'health',
                    'metrics',
                    'cache',
                    'scheduler',
                    'queue',
                    'storage',
                    'backups',
                    'alerts',
                ],
            ]);
    }

    public function test_admin_can_access_phpinfo_endpoint(): void
    {
        $token = $this->admin->createToken('admin_test')->plainTextToken;

        $response = $this->getJson('/api/admin/system/phpinfo', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'php_version',
                    'interface',
                    'memory_limit',
                    'max_execution_time',
                    'loaded_extensions',
                ],
            ]);
    }

    // ─── 2. Services Unit & Integration Checks ─────────────────────────────

    public function test_system_health_service_database_check(): void
    {
        /** @var SystemHealthService $service */
        $service = app(SystemHealthService::class);
        $warnings = [];
        $errors = [];

        $dbCheck = $service->checkDatabase($warnings, $errors);

        $this->assertEquals('healthy', $dbCheck['status']);
        $this->assertTrue($dbCheck['connected']);
        $this->assertGreaterThanOrEqual(0, $dbCheck['response_time_ms']);
    }

    public function test_system_health_service_cache_check(): void
    {
        /** @var SystemHealthService $service */
        $service = app(SystemHealthService::class);
        $warnings = [];
        $errors = [];

        $cacheCheck = $service->checkCache($warnings, $errors);

        $this->assertEquals('healthy', $cacheCheck['status']);
        $this->assertTrue($cacheCheck['write_success']);
        $this->assertTrue($cacheCheck['read_success']);
        $this->assertTrue($cacheCheck['delete_success']);
    }

    public function test_system_health_service_filesystem_check(): void
    {
        /** @var SystemHealthService $service */
        $service = app(SystemHealthService::class);
        $warnings = [];
        $errors = [];

        $fsCheck = $service->checkFilesystem($warnings, $errors);

        $this->assertEquals('healthy', $fsCheck['status']);
        $this->assertArrayHasKey('storage', $fsCheck['details']);
        $this->assertArrayHasKey('public', $fsCheck['details']);
        $this->assertArrayHasKey('backups', $fsCheck['details']);
        $this->assertTrue($fsCheck['details']['storage']['writable']);
    }

    public function test_system_health_service_queue_and_scheduler_checks(): void
    {
        /** @var SystemHealthService $service */
        $service = app(SystemHealthService::class);
        $warnings = [];
        $errors = [];

        $queueCheck = $service->checkQueue($warnings, $errors);
        $schedulerCheck = $service->checkScheduler($warnings, $errors);

        $this->assertArrayHasKey('pending_jobs', $queueCheck);
        $this->assertArrayHasKey('failed_jobs', $queueCheck);
        $this->assertArrayHasKey('active', $schedulerCheck);
    }

    public function test_system_metrics_service_returns_structured_data(): void
    {
        /** @var SystemMetricsService $service */
        $service = app(SystemMetricsService::class);
        $metrics = $service->getMetrics();

        $this->assertArrayHasKey('cpu', $metrics);
        $this->assertArrayHasKey('ram', $metrics);
        $this->assertArrayHasKey('disk', $metrics);
        $this->assertArrayHasKey('database', $metrics);
        $this->assertArrayHasKey('cache', $metrics);
        $this->assertArrayHasKey('filesystem', $metrics);
        $this->assertArrayHasKey('queue', $metrics);
        $this->assertArrayHasKey('scheduler', $metrics);
        $this->assertArrayHasKey('performance', $metrics);

        $this->assertGreaterThan(0, $metrics['ram']['current_mb']);
    }

    public function test_production_log_service_writes_enriched_logs(): void
    {
        Log::shouldReceive('channel')
            ->once()
            ->with('daily')
            ->andReturnSelf();

        Log::shouldReceive('info')
            ->once()
            ->with('Test Info Message', \Mockery::on(function ($context) {
                return isset($context['timestamp']) && isset($context['memory']);
            }));

        /** @var ProductionLogService $logger */
        $logger = app(ProductionLogService::class);
        $logger->info('Test Info Message');
    }

    public function test_monitoring_dashboard_service_detects_alerts(): void
    {
        /** @var MonitoringDashboardService $service */
        $service = app(MonitoringDashboardService::class);

        $mockHealth = [
            'status' => 'unhealthy',
            'checks' => [
                'database' => ['connected' => false],
                'cache' => ['status' => 'unhealthy'],
                'scheduler' => ['active' => false],
            ],
        ];

        $mockMetrics = [
            'disk' => ['used_percentage' => 95.0, 'free_bytes' => 10485760],
            'ram' => ['current_mb' => 500],
            'queue' => ['failed_jobs' => 15],
        ];

        $alerts = $service->detectAlerts($mockHealth, $mockMetrics);

        $this->assertNotEmpty($alerts);
        $alertIds = array_column($alerts, 'id');
        $this->assertContains('db_unreachable', $alertIds);
        $this->assertContains('cache_unavailable', $alertIds);
        $this->assertContains('disk_critical', $alertIds);
        $this->assertContains('scheduler_inactive', $alertIds);
        $this->assertContains('queue_high_failed_jobs', $alertIds);
    }

    public function test_monitoring_middleware_attaches_debug_headers_in_non_prod(): void
    {
        $token = $this->admin->createToken('admin_test')->plainTextToken;

        $response = $this->getJson('/api/categories', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200);
        $response->assertHeader('X-Request-Time');
        $response->assertHeader('X-Memory');
        $response->assertHeader('X-SQL-Time');
        $response->assertHeader('X-SQL-Queries');
    }

    public function test_monitoring_middleware_logs_slow_requests(): void
    {
        Config::set('monitoring.slow_request_threshold', -1); // Forcer toute requête (> -1 ms) à être considérée lente

        $this->mock(ProductionLogService::class, function ($mock) {
            $mock->shouldReceive('warning')->atLeast()->once();
        });

        $token = $this->admin->createToken('admin_test')->plainTextToken;

        $this->getJson('/api/categories', [
            'Authorization' => "Bearer {$token}",
        ]);
    }

    public function test_configuration_drives_monitoring_behavior(): void
    {
        $this->assertEquals('daily', config('monitoring.log_channel'));
        $this->assertEquals(1000, config('monitoring.slow_request_threshold'));
        $this->assertEquals(200, config('monitoring.slow_query_threshold'));
        $this->assertEquals(80.0, config('monitoring.disk_warning'));
        $this->assertEquals(90.0, config('monitoring.disk_critical'));
    }

    public function test_non_regression_existing_routes(): void
    {
        $this->getJson('/api/categories')->assertStatus(200);
        $this->getJson('/api/products')->assertStatus(200);
    }
}
