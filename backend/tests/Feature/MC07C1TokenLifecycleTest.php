<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MC07C1TokenLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_relogin_revokes_the_previous_token_and_keeps_one_active_token(): void
    {
        $password = 'AdminPassword!123';
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'password' => Hash::make($password),
        ]);

        $oldToken = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => $password,
        ])->assertOk()->json('data.token');

        $newToken = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => $password,
        ])->assertOk()->json('data.token');

        $this->withToken($oldToken)->getJson('/api/admin/me')->assertUnauthorized();
        $this->withToken($newToken)->getJson('/api/admin/me')->assertOk();
        $this->assertSame(1, $admin->tokens()->count());
        $this->assertNotNull($admin->tokens()->first()->expires_at);
    }

    public function test_expired_token_is_rejected_and_current_token_is_accepted(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $expired = $admin->createToken('admin-token', ['admin'], now()->subMinute())->plainTextToken;

        $this->withToken($expired)->getJson('/api/admin/me')->assertUnauthorized();

        $current = $admin->createToken('admin-token', ['admin'], now()->addHour())->plainTextToken;
        $this->withToken($current)->getJson('/api/admin/me')->assertOk();
    }

    public function test_admin_logout_revokes_current_token(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $token = $admin->createToken('admin-token', ['admin'], now()->addHour())->plainTextToken;

        $this->withToken($token)->postJson('/api/admin/logout')->assertOk();
        $this->app->make('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/admin/me')->assertUnauthorized();
    }
}
