<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1RoleIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_surface_requires_a_customer_identity(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();

        $customer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($customer, 'sanctum')->getJson('/api/auth/me')->assertOk();

        $this->app->make('auth')->forgetGuards();
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->actingAs($admin, 'sanctum')->getJson('/api/auth/me')->assertForbidden();
    }

    public function test_customer_cannot_mass_assign_role_through_profile(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer, 'sanctum')->putJson('/api/auth/profile', [
            'first_name' => 'Updated',
            'role' => User::ROLE_ADMIN,
            'is_admin' => true,
            'user_id' => 999999,
        ])->assertOk();

        $this->assertSame('customer', $customer->fresh()->role);
    }
}
