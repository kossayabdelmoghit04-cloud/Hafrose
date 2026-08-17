<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests de l'API de consultation du journal d'activité global.
 *
 * Couvre : accès, authentification, autorisation, pagination, filtres, détail.
 */
class ActivityLogApiTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private function createAdmin(): User
    {
        return User::firstOrCreate(
            ['email' => 'admin@hafrose.com'],
            ['name' => 'Admin User', 'password' => bcrypt('Admin@Hafrose2024!'), 'role' => User::ROLE_ADMIN]
        );
    }

    private function createCustomer(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    private function seedLogs(int $count = 5, array $overrides = []): void
    {
        $service = app(ActivityLogService::class);

        for ($i = 0; $i < $count; $i++) {
            $service->log(
                eventType: $overrides['event_type'] ?? ActivityLog::EVENT_USER_LOGIN,
                category: $overrides['category'] ?? ActivityLog::CATEGORY_AUTH,
                resource: $overrides['resource'] ?? 'users',
                metadata: ['index' => $i],
            );
        }
    }

    // ─── Tests d'accès ─────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_access_activity_logs(): void
    {
        $this->getJson('/api/admin/activity-logs')
            ->assertUnauthorized();
    }

    public function test_customer_cannot_access_activity_logs(): void
    {
        $customer = $this->createCustomer();
        $token = $customer->createToken('token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/admin/activity-logs')
            ->assertForbidden();
    }

    public function test_admin_can_access_activity_logs(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $this->seedLogs(3);

        $response = $this->withToken($token)
            ->getJson('/api/admin/activity-logs');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    '*' => [
                        'id',
                        'event_type',
                        'category',
                        'resource',
                        'resource_id',
                        'metadata',
                        'ip_address',
                        'user_agent',
                        'created_at',
                    ],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertEquals(3, $response->json('meta.total'));
    }

    // ─── Tests de pagination ────────────────────────────────────────────────────

    public function test_activity_logs_are_paginated(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $this->seedLogs(25);

        $response = $this->withToken($token)
            ->getJson('/api/admin/activity-logs?per_page=10');

        $response->assertOk();
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(25, $response->json('meta.total'));
        $this->assertEquals(3, $response->json('meta.last_page'));
    }

    // ─── Tests de filtres ──────────────────────────────────────────────────────

    public function test_activity_logs_can_be_filtered_by_category(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        // 3 logs auth + 2 logs security
        $this->seedLogs(3, ['category' => ActivityLog::CATEGORY_AUTH]);
        $this->seedLogs(2, [
            'category' => ActivityLog::CATEGORY_SECURITY,
            'event_type' => ActivityLog::EVENT_HONEYPOT_TRIGGERED,
        ]);

        $response = $this->withToken($token)
            ->getJson('/api/admin/activity-logs?category=security');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
        $this->assertEquals('security', $response->json('data.0.category'));
    }

    public function test_activity_logs_can_be_filtered_by_event_type(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $this->seedLogs(2, ['event_type' => ActivityLog::EVENT_USER_LOGIN]);
        $this->seedLogs(3, ['event_type' => ActivityLog::EVENT_ORDER_CREATED, 'category' => ActivityLog::CATEGORY_ORDER]);

        $response = $this->withToken($token)
            ->getJson('/api/admin/activity-logs?event_type=auth.login');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_activity_logs_can_be_filtered_by_date_range(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $this->seedLogs(3);

        $today = now()->format('Y-m-d');
        $tomorrow = now()->addDay()->format('Y-m-d');

        $response = $this->withToken($token)
            ->getJson("/api/admin/activity-logs?date_from={$today}&date_to={$tomorrow}");

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_activity_logs_invalid_category_returns_validation_error(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/admin/activity-logs?category=invalid_category');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['category']);
    }

    // ─── Tests de détail ───────────────────────────────────────────────────────

    public function test_admin_can_view_single_activity_log(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $log = ActivityLog::create([
            'event_type' => ActivityLog::EVENT_USER_LOGIN,
            'category' => ActivityLog::CATEGORY_AUTH,
            'resource' => 'users',
            'resource_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'TestAgent/1.0',
            'metadata' => ['email' => $admin->email],
        ]);

        $response = $this->withToken($token)
            ->getJson("/api/admin/activity-logs/{$log->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $log->id)
            ->assertJsonPath('data.event_type', ActivityLog::EVENT_USER_LOGIN)
            ->assertJsonPath('data.category', ActivityLog::CATEGORY_AUTH);
    }

    public function test_show_returns_404_for_nonexistent_log(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/admin/activity-logs/99999')
            ->assertNotFound();
    }

    // ─── Tests immutabilité ────────────────────────────────────────────────────

    public function test_activity_logs_api_does_not_expose_mutation_endpoints(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        // POST → doit retourner 404 ou 405
        $postStatus = $this->withToken($token)
            ->postJson('/api/admin/activity-logs', [])
            ->status();

        $this->assertContains($postStatus, [404, 405]);

        // DELETE → doit retourner 404 ou 405
        $deleteStatus = $this->withToken($token)
            ->deleteJson('/api/admin/activity-logs/1')
            ->status();

        $this->assertContains($deleteStatus, [404, 405]);
    }
}
