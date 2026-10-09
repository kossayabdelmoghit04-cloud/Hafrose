<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1PaginationValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_media_pagination_is_bounded(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        foreach ([101, 100000] as $invalid) {
            $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/media?per_page='.$invalid)
                ->assertUnprocessable()
                ->assertJsonValidationErrors('per_page');
        }

        $this->actingAs($admin, 'sanctum')->getJson('/api/admin/media?per_page=100')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 100);
    }

    public function test_customer_orders_are_paginated_with_metadata_and_bounds(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Order::factory()->count(3)->create(['user_id' => $customer->id]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/auth/orders?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 3);

        $this->actingAs($customer, 'sanctum')->getJson('/api/auth/orders?per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }
}
