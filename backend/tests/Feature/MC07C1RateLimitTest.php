<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class MC07C1RateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_heavy_admin_operation_is_rate_limited(): void
    {
        Queue::fake();
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $token = $admin->createToken('admin-token')->plainTextToken;

        for ($i = 0; $i < 5; $i++) {
            $this->withToken($token)->postJson('/api/admin/system/backup')->assertAccepted();
        }

        $this->withToken($token)->postJson('/api/admin/system/backup')->assertTooManyRequests();
    }

    public function test_bulk_batch_larger_than_one_hundred_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/products/bulk', [
            'action' => 'delete',
            'ids' => range(1, 101),
        ])->assertUnprocessable()->assertJsonValidationErrors('ids');
    }
}
