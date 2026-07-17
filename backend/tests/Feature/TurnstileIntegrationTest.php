<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TurnstileIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Configure standard keys for tests
        Config::set('turnstile.secret_key', 'mock-secret-key');
        Config::set('turnstile.verify_url', 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    }

    /**
     * Test when Turnstile is disabled. Submissions should succeed even without token.
     */
    public function test_submissions_succeed_when_turnstile_is_disabled(): void
    {
        Config::set('turnstile.enabled', false);

        $payload = [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);
    }

    /**
     * Test when Turnstile is enabled and token is missing. Should return 422.
     */
    public function test_submission_fails_when_token_is_missing(): void
    {
        Config::set('turnstile.enabled', true);

        $payload = [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                     'errors' => [
                         'cf-turnstile-response' => ['La vérification CAPTCHA a échoué. Veuillez actualiser la page et réessayer.']
                     ]
                 ]);
    }

    /**
     * Test when Turnstile is enabled and token is invalid. Should return 422.
     */
    public function test_submission_fails_when_token_is_invalid(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => false,
                'error-codes' => ['invalid-input-response']
            ], 200)
        ]);

        $payload = [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
            'cf-turnstile-response' => 'invalid-token'
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);
    }

    /**
     * Test when Turnstile is enabled and token is valid. Should succeed (201).
     */
    public function test_submission_succeeds_when_token_is_valid(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => true
            ], 200)
        ]);

        $payload = [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
            'cf-turnstile-response' => 'valid-token'
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);
    }

    /**
     * Test when Turnstile verification times out or returns error.
     */
    public function test_submission_fails_on_turnstile_network_error(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake([
            'challenges.cloudflare.com/*' => Http::sequence()
                ->pushStatus(500)
        ]);

        $payload = [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
            'cf-turnstile-response' => 'valid-token'
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);
    }
}
