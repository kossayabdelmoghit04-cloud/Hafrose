<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PolicySecurityTest — Vérifie les règles d'autorisation centralisées (ARC-03).
 *
 * Teste explicitement :
 *  - Owner → authorized
 *  - Non-owner → forbidden (403)
 *  - Unauthenticated → unauthorized (401)
 *  - IDOR : User A accède à la ressource de User B → 403
 */
class PolicySecurityTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function createUserWithToken(): array
    {
        $user = User::factory()->create(['role' => 'customer']);
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    private function authHeader(string $token): array
    {
        return ['Authorization' => "Bearer {$token}"];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ORDER POLICY
    // ─────────────────────────────────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_orders(): void
    {
        $response = $this->getJson('/api/auth/orders');
        $response->assertStatus(401);
    }

    public function test_authenticated_customer_can_access_own_orders(): void
    {
        [$user, $token] = $this->createUserWithToken();

        $response = $this->getJson('/api/auth/orders', $this->authHeader($token));
        $response->assertStatus(200);
    }

    public function test_owner_can_view_own_order_details(): void
    {
        [$user, $token] = $this->createUserWithToken();
        $product = Product::factory()->create(['stock' => 5, 'price' => 100.00]);
        $order = Order::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/auth/orders/{$order->id}", $this->authHeader($token));
        $response->assertStatus(200);
    }

    public function test_idor_user_a_cannot_access_user_b_order(): void
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();

        // Créer une commande appartenant à User B
        $orderB = Order::factory()->create(['user_id' => $userB->id]);

        // User A tente d'accéder à la commande de User B via l'ID
        $response = $this->getJson("/api/auth/orders/{$orderB->id}", $this->authHeader($tokenA));
        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_order_details(): void
    {
        $order = Order::factory()->create();
        $response = $this->getJson("/api/auth/orders/{$order->id}");
        $response->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER ADDRESS POLICY
    // ─────────────────────────────────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_addresses(): void
    {
        $response = $this->getJson('/api/auth/addresses');
        $response->assertStatus(401);
    }

    public function test_authenticated_customer_can_list_own_addresses(): void
    {
        [$user, $token] = $this->createUserWithToken();

        $response = $this->getJson('/api/auth/addresses', $this->authHeader($token));
        $response->assertStatus(200);
    }

    public function test_idor_user_a_cannot_update_user_b_address(): void
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();

        // Créer une adresse appartenant à User B
        $addressB = UserAddress::factory()->create(['user_id' => $userB->id]);

        // User A tente de modifier l'adresse de User B
        $response = $this->putJson(
            "/api/auth/addresses/{$addressB->id}",
            ['name' => 'Pirate Name'],
            $this->authHeader($tokenA)
        );
        $response->assertStatus(403);
    }

    public function test_idor_user_a_cannot_delete_user_b_address(): void
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();

        $addressB = UserAddress::factory()->create(['user_id' => $userB->id]);

        $response = $this->deleteJson(
            "/api/auth/addresses/{$addressB->id}",
            [],
            $this->authHeader($tokenA)
        );
        $response->assertStatus(403);
    }

    public function test_idor_user_a_cannot_set_user_b_address_as_default(): void
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();

        $addressB = UserAddress::factory()->create(['user_id' => $userB->id]);

        $response = $this->patchJson(
            "/api/auth/addresses/{$addressB->id}/default",
            [],
            $this->authHeader($tokenA)
        );
        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_delete_address(): void
    {
        $address = UserAddress::factory()->create();
        $response = $this->deleteJson("/api/auth/addresses/{$address->id}");
        $response->assertStatus(401);
    }

    public function test_owner_can_update_own_address(): void
    {
        [$user, $token] = $this->createUserWithToken();
        $address = UserAddress::factory()->create(['user_id' => $user->id]);

        $response = $this->putJson(
            "/api/auth/addresses/{$address->id}",
            ['name' => 'Nouveau Nom'],
            $this->authHeader($token)
        );
        $response->assertStatus(200);
    }

    /** @test */
    public function test_owner_can_delete_own_address(): void
    {
        [$user, $token] = $this->createUserWithToken();
        $address = UserAddress::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson(
            "/api/auth/addresses/{$address->id}",
            [],
            $this->authHeader($token)
        );
        $response->assertStatus(200);
    }
}
