<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email'    => 'admin@hafrose.com',
            'password' => bcrypt('Admin@Hafrose2024!'),
            'role'     => User::ROLE_ADMIN,
        ]);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public function test_admin_can_login_with_valid_credentials(): void
    {
        $this->createAdmin();

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'Admin@Hafrose2024!',
        ]);

        $response->assertOk()
                 ->assertJsonStructure([
                     'success', 'message',
                     'data' => ['token', 'user' => ['id', 'name', 'email', 'role']],
                 ])
                 ->assertJsonFragment(['success' => true]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->createAdmin();

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnauthorized()
                 ->assertJsonFragment(['success' => false]);
    }

    public function test_login_fails_for_non_admin_user(): void
    {
        User::factory()->create([
            'email'    => 'user@example.com',
            'password' => bcrypt('password'),
            'role'     => 'customer',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'user@example.com',
            'password' => 'password',
        ]);

        $response->assertUnauthorized();
    }

    public function test_login_fails_validation_without_email(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'password' => 'something',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonFragment(['success' => false]);
    }

    // ─── Me ───────────────────────────────────────────────────────────────────

    public function test_authenticated_admin_can_get_profile(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/me');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => ['id', 'name', 'email', 'role'],
                 ]);
    }

    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $response = $this->getJson('/api/admin/me');

        $response->assertUnauthorized();
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function test_admin_can_logout(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/logout');

        $response->assertOk()
                 ->assertJsonFragment(['success' => true]);
    }

    public function test_non_admin_cannot_access_protected_routes(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $token = $user->createToken('user-token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/dashboard');

        $response->assertForbidden();
    }
}
