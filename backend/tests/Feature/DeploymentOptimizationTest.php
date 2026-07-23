<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\AdminLog;
use App\Models\User;
use App\Services\DeploymentHealthService;
use App\Services\DeploymentOptimizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DeploymentOptimizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        $this->admin = User::factory()->create([
            'email' => 'admin_deploy@hafrose.com',
            'role' => User::ROLE_ADMIN,
        ]);
        $this->admin->assignRole($adminRole);

        $this->customer = User::factory()->create([
            'email' => 'customer_deploy@hafrose.com',
            'role' => 'customer',
        ]);
        $this->customer->assignRole($customerRole);
    }

    // ─── 1. Tests d'Authentification (401) ──────────────────────────────────

    public function test_unauthenticated_user_cannot_access_deployment_endpoints(): void
    {
        $this->getJson('/api/admin/system/deployment/status')->assertStatus(401);
        $this->postJson('/api/admin/system/deployment/optimize')->assertStatus(401);
        $this->postJson('/api/admin/system/deployment/clear')->assertStatus(401);
        $this->postJson('/api/admin/system/deployment/warmup')->assertStatus(401);
    }

    // ─── 2. Tests d'Autorisation (403) ───────────────────────────────────────

    public function test_non_admin_user_cannot_access_deployment_endpoints(): void
    {
        $token = $this->customer->createToken('test-token')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->getJson('/api/admin/system/deployment/status', $headers)->assertStatus(403);
        $this->postJson('/api/admin/system/deployment/optimize', [], $headers)->assertStatus(403);
        $this->postJson('/api/admin/system/deployment/clear', [], $headers)->assertStatus(403);
        $this->postJson('/api/admin/system/deployment/warmup', [], $headers)->assertStatus(403);
    }

    // ─── 3. Endpoint Statut Déploiement (200) ────────────────────────────────

    public function test_admin_can_access_deployment_status_endpoint(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->getJson('/api/admin/system/deployment/status', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'health' => [
                        'overall_status',
                        'checks',
                        'summary',
                    ],
                    'config',
                ],
            ]);
    }

    // ─── 4. Endpoints d'Action (200 + Logs) ──────────────────────────────────

    public function test_admin_can_optimize_deployment_and_generates_logs(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->postJson('/api/admin/system/deployment/optimize', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'success',
                    'duration',
                    'message',
                    'details',
                ],
            ]);

        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $this->admin->id,
            'action' => AdminLog::ACTION_DEPLOYMENT_OPTIMIZE,
            'resource' => AdminLog::RESOURCE_SYSTEM,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'event_type' => 'deployment.optimize',
            'category' => ActivityLog::CATEGORY_ADMIN,
        ]);
    }

    public function test_admin_can_clear_deployment_caches_and_generates_logs(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->postJson('/api/admin/system/deployment/clear', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'success',
                    'duration',
                    'message',
                    'details',
                ],
            ]);

        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $this->admin->id,
            'action' => AdminLog::ACTION_DEPLOYMENT_CLEAR,
            'resource' => AdminLog::RESOURCE_SYSTEM,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'event_type' => 'deployment.clear',
            'category' => ActivityLog::CATEGORY_ADMIN,
        ]);
    }

    public function test_admin_can_warmup_deployment_caches_and_generates_logs(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->postJson('/api/admin/system/deployment/warmup', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'success',
                    'duration',
                    'message',
                    'details',
                ],
            ]);

        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $this->admin->id,
            'action' => AdminLog::ACTION_DEPLOYMENT_WARMUP,
            'resource' => AdminLog::RESOURCE_SYSTEM,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'event_type' => 'deployment.warmup',
            'category' => ActivityLog::CATEGORY_ADMIN,
        ]);
    }

    // ─── 5. Tests des Services ───────────────────────────────────────────────

    public function test_deployment_optimization_service_methods(): void
    {
        /** @var DeploymentOptimizationService $service */
        $service = app(DeploymentOptimizationService::class);

        $optimizeResult = $service->optimize();
        $this->assertIsArray($optimizeResult);
        $this->assertArrayHasKey('success', $optimizeResult);
        $this->assertArrayHasKey('duration', $optimizeResult);
        $this->assertArrayHasKey('message', $optimizeResult);

        $clearResult = $service->clearCaches();
        $this->assertIsArray($clearResult);
        $this->assertArrayHasKey('success', $clearResult);
        $this->assertArrayHasKey('duration', $clearResult);
        $this->assertArrayHasKey('message', $clearResult);

        $warmupResult = $service->warmupCaches();
        $this->assertIsArray($warmupResult);
        $this->assertArrayHasKey('success', $warmupResult);
        $this->assertArrayHasKey('duration', $warmupResult);
        $this->assertArrayHasKey('message', $warmupResult);
    }

    public function test_deployment_health_service_check_all(): void
    {
        /** @var DeploymentHealthService $service */
        $service = app(DeploymentHealthService::class);

        $report = $service->checkAll();

        $this->assertIsArray($report);
        $this->assertArrayHasKey('overall_status', $report);
        $this->assertArrayHasKey('checks', $report);
        $this->assertArrayHasKey('summary', $report);

        $this->assertArrayHasKey('storage_writable', $report['checks']);
        $this->assertArrayHasKey('bootstrap_cache_writable', $report['checks']);
        $this->assertArrayHasKey('config_cache', $report['checks']);
        $this->assertArrayHasKey('route_cache', $report['checks']);
        $this->assertArrayHasKey('view_cache', $report['checks']);
        $this->assertArrayHasKey('event_cache', $report['checks']);
        $this->assertArrayHasKey('queue_config', $report['checks']);
        $this->assertArrayHasKey('scheduler_config', $report['checks']);
        $this->assertArrayHasKey('opcache_status', $report['checks']);
        $this->assertArrayHasKey('php_version', $report['checks']);
        $this->assertArrayHasKey('required_extensions', $report['checks']);
        $this->assertArrayHasKey('permissions', $report['checks']);
    }

    // ─── 6. Test de la Commande Artisan ──────────────────────────────────────

    public function test_artisan_deploy_optimize_command_executes_successfully(): void
    {
        $this->artisan('hafrose:deploy:optimize', [
            '--force' => true,
            '--clear' => true,
            '--warmup' => true,
        ])
            ->assertExitCode(0);
    }
}
