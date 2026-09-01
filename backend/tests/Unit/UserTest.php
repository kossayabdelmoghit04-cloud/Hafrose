<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_admin_returns_true_for_admin_role_column(): void
    {
        $user = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $this->assertTrue($user->isAdmin());
    }

    public function test_is_admin_returns_true_for_spatie_admin_role(): void
    {
        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $user = User::factory()->create([
            'role' => 'customer',
        ]);
        $user->assignRole($role);

        $this->assertTrue($user->isAdmin());
    }

    public function test_is_admin_returns_false_for_customer(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $this->assertFalse($user->isAdmin());
    }
}
