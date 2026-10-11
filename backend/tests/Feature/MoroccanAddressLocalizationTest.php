<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserAddress;
use App\Support\Location\MarketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MoroccanAddressLocalizationTest extends TestCase
{
    use RefreshDatabase;

    private function createCustomerWithToken(): array
    {
        $user = User::factory()->create(['role' => 'customer']);
        $token = $user->createToken('test-token')->plainTextToken;

        return [$user, $token];
    }

    private function authHeader(string $token): array
    {
        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_customer_can_create_address_with_valid_moroccan_city(): void
    {
        [$user, $token] = $this->createCustomerWithToken();

        $payload = [
            'title' => 'Résidence Casablanca',
            'name' => 'Lalla Salma',
            'address' => '12 Boulevard de la Corniche, Anfa',
            'city' => 'Casablanca',
            'postal_code' => '20000',
            'country' => 'Maroc',
            'phone' => '+212661000000',
        ];

        $response = $this->postJson('/api/auth/addresses', $payload, $this->authHeader($token));

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'city' => 'Casablanca',
                    'country' => 'Maroc',
                ],
            ]);

        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'city' => 'Casablanca',
            'country' => 'Maroc',
        ]);
    }

    public function test_customer_address_creation_rejects_unauthorized_country(): void
    {
        [$user, $token] = $this->createCustomerWithToken();

        $payload = [
            'title' => 'Bureau Paris',
            'name' => 'Jean Dupont',
            'address' => '10 Avenue Montaigne',
            'city' => 'Paris',
            'postal_code' => '75008',
            'country' => 'France',
            'phone' => '+33100000000',
        ];

        $response = $this->postJson('/api/auth/addresses', $payload, $this->authHeader($token));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['country', 'city']);
    }

    public function test_customer_address_creation_rejects_invalid_moroccan_city(): void
    {
        [$user, $token] = $this->createCustomerWithToken();

        $payload = [
            'title' => 'Maison',
            'name' => 'Test User',
            'address' => 'Rue Fictive',
            'city' => 'VilleInconnue123',
            'postal_code' => '20000',
            'country' => 'Maroc',
            'phone' => '+212600000000',
        ];

        $response = $this->postJson('/api/auth/addresses', $payload, $this->authHeader($token));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['city']);
    }

    public function test_customer_address_creation_accepts_accented_and_unaccented_moroccan_cities(): void
    {
        [$user, $token] = $this->createCustomerWithToken();

        // Testing unaccented 'Fes' -> canonicalized to 'Fès'
        $payload = [
            'title' => 'Riad Fès',
            'name' => 'Moulay Idris',
            'address' => 'Batha, Médina',
            'city' => 'Fes',
            'postal_code' => '30000',
            'country' => 'Maroc',
            'phone' => '+212662000000',
        ];

        $response = $this->postJson('/api/auth/addresses', $payload, $this->authHeader($token));

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'city' => 'Fès',
                    'country' => 'Maroc',
                ],
            ]);
    }

    public function test_market_service_verifies_exhaustive_moroccan_coverage(): void
    {
        $this->assertTrue(MarketService::isCountryAllowed('Maroc'));
        $this->assertTrue(MarketService::isCountryAllowed('Morocco'));
        $this->assertTrue(MarketService::isCountryAllowed('MA'));
        $this->assertFalse(MarketService::isCountryAllowed('France'));
        $this->assertFalse(MarketService::isCountryAllowed('United States'));

        $this->assertTrue(MarketService::isMoroccanCityValid('Casablanca'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Rabat'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Marrakech'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Tanger'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Fès'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Agadir'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Tétouan'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Laâyoune'));
        $this->assertTrue(MarketService::isMoroccanCityValid('Dakhla'));
        $this->assertFalse(MarketService::isMoroccanCityValid('London'));
    }
}
