<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\DeploymentOptimizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class MC07C1ErrorDisclosureTest extends TestCase
{
    use RefreshDatabase;

    public function test_system_exception_is_logged_but_returns_a_generic_production_message(): void
    {
        config(['app.env' => 'production', 'app.debug' => false]);
        $this->mock(DeploymentOptimizationService::class, function ($mock): void {
            $mock->shouldReceive('optimize')->once()->andThrow(
                new RuntimeException('SQLSTATE secret at C:\\server\\private\\config.php')
            );
        });
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/system/deployment/optimize')
            ->assertInternalServerError();

        $content = $response->getContent();
        $this->assertStringNotContainsString('SQLSTATE', $content);
        $this->assertStringNotContainsString('config.php', $content);
        $this->assertStringNotContainsString('server\\private', $content);
    }
}
