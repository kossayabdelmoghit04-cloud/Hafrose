<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1SystemInformationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_system_responses_omit_paths_database_name_and_runtime_versions(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->actingAs($admin, 'sanctum');

        $this->getJson('/api/admin/system/health')->assertOk()
            ->assertJsonMissingPath('data.checks.database.database')
            ->assertJsonMissingPath('data.checks.filesystem.details.storage.path')
            ->assertJsonMissingPath('data.checks.php.version')
            ->assertJsonMissingPath('data.checks.server.hostname');

        $this->getJson('/api/admin/system/metrics')->assertOk()
            ->assertJsonMissingPath('data.database.database')
            ->assertJsonMissingPath('data.filesystem.storage_path')
            ->assertJsonMissingPath('data.filesystem.backups_path');

        $this->getJson('/api/admin/system/status')->assertOk()
            ->assertJsonMissingPath('data.summary.php_version')
            ->assertJsonMissingPath('data.summary.laravel_version')
            ->assertJsonMissingPath('data.summary.environment');

        $this->getJson('/api/admin/system/phpinfo')->assertOk()
            ->assertJsonMissingPath('data.php_version')
            ->assertJsonMissingPath('data.interface')
            ->assertJsonMissingPath('data.loaded_extensions');
    }
}
