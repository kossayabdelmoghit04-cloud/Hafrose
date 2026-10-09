<?php

namespace Tests\Feature;

use App\Models\TwoFactorCredential;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1TwoFactorSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_incomplete_two_factor_setup_endpoint_is_not_exposed(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/security/2fa/setup')
            ->assertNotFound();

        $this->assertSame(0, TwoFactorCredential::query()->count());
    }
}
