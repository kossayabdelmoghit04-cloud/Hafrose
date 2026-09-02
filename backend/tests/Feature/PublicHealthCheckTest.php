<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicHealthCheckTest extends TestCase
{
    public function test_public_health_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'services' => [
                    'application',
                    'database',
                    'storage',
                ],
            ])
            ->assertJson([
                'status' => 'healthy',
                'services' => [
                    'application' => 'ok',
                    'database' => 'ok',
                    'storage' => 'ok',
                ],
            ]);
    }

    public function test_web_health_endpoint_returns_success(): void
    {
        $response = $this->get('/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'healthy',
            ]);
    }

    public function test_deploy_status_artisan_command(): void
    {
        $this->artisan('hafrose:deploy:status')
            ->assertSuccessful();

        $this->artisan('hafrose:deploy:status --json')
            ->assertSuccessful();
    }
}
