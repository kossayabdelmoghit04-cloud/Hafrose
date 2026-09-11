<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserSeederSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_is_not_seeded_without_explicit_opt_in_and_credentials(): void
    {
        config()->set('admin-seeder.enabled', false);
        config()->set('admin-seeder.email', null);
        config()->set('admin-seeder.password', null);

        $this->seed(AdminUserSeeder::class);

        $this->assertDatabaseMissing('users', ['role' => User::ROLE_ADMIN]);
    }

    public function test_admin_can_be_seeded_with_explicit_environment_credentials(): void
    {
        config()->set('admin-seeder.enabled', true);
        config()->set('admin-seeder.email', 'configured-admin@example.test');
        config()->set('admin-seeder.password', 'environment-only-test-value');

        $this->seed(AdminUserSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'configured-admin@example.test',
            'role' => User::ROLE_ADMIN,
        ]);
    }
}
