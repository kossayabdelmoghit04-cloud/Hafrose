<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * TurnstileIntegrationTest
 *
 * Suite complète de tests Feature pour la protection Cloudflare Turnstile.
 *
 * Couvre :
 * - Turnstile désactivé (CI/CD)
 * - Token absent, vide, invalide, valide
 * - Erreur réseau Cloudflare (HTTP 500) et timeout (ConnectionException)
 * - Clé secrète non configurée (fallback sécurisé)
 * - Scope du middleware (routes non protégées)
 * - Interaction avec le middleware Honeypot (ordre d'exécution)
 * - Assertion du logging lors des échecs
 *
 * @see App\Http\Middleware\VerifyTurnstileToken
 * @see App\Services\TurnstileService
 */
class TurnstileIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('turnstile.secret_key', 'mock-secret-key');
        Config::set('turnstile.verify_url', 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
        Config::set('turnstile.log_channel', 'stack');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Tests existants (préservés)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lorsque Turnstile est désactivé, les soumissions réussissent sans token.
     */
    public function test_submissions_succeed_when_turnstile_is_disabled(): void
    {
        Config::set('turnstile.enabled', false);

        $response = $this->postJson('/api/contact', $this->validContactPayload());

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);
    }

    /**
     * Lorsque le token est absent, la soumission échoue avec HTTP 422.
     */
    public function test_submission_fails_when_token_is_missing(): void
    {
        Config::set('turnstile.enabled', true);

        $response = $this->postJson('/api/contact', $this->validContactPayload());

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                     'errors'  => [
                         'cf-turnstile-response' => [
                             'La vérification CAPTCHA a échoué. Veuillez actualiser la page et réessayer.',
                         ],
                     ],
                 ]);
    }

    /**
     * Lorsque le token est invalide (Cloudflare répond success=false), HTTP 422.
     */
    public function test_submission_fails_when_token_is_invalid(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success'     => false,
                'error-codes' => ['invalid-input-response'],
            ], 200),
        ]);

        $response = $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => 'invalid-token']
        ));

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);
    }

    /**
     * Lorsque le token est valide (Cloudflare répond success=true), HTTP 201.
     */
    public function test_submission_succeeds_when_token_is_valid(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake([
            'challenges.cloudflare.com/*' => Http::response(['success' => true], 200),
        ]);

        $response = $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => 'valid-token']
        ));

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);
    }

    /**
     * Lorsque Cloudflare retourne une erreur HTTP 500, la soumission échoue.
     */
    public function test_submission_fails_on_turnstile_network_error(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake([
            'challenges.cloudflare.com/*' => Http::sequence()->pushStatus(500),
        ]);

        $response = $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => 'valid-token']
        ));

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Nouveaux tests — edge cases et scope
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Un token vide ("") doit être traité comme absent et refusé sans appel réseau.
     */
    public function test_submission_fails_when_token_is_empty_string(): void
    {
        Config::set('turnstile.enabled', true);

        // Http::fake() non configuré : si un appel réseau était effectué, le test échouerait.
        Http::fake();

        $response = $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => '']
        ));

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);

        // Vérifier qu'aucun appel réseau n'a été effectué vers Cloudflare.
        Http::assertNothingSent();
    }

    /**
     * Lorsque la clé secrète est absente de la configuration,
     * le service doit refuser la requête de manière sécurisée sans paniquer.
     */
    public function test_submission_fails_securely_when_secret_key_is_missing(): void
    {
        Config::set('turnstile.enabled', true);
        Config::set('turnstile.secret_key', '');

        Http::fake();

        $response = $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => 'any-token']
        ));

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);

        // Aucun appel réseau ne doit être effectué si la clé est absente.
        Http::assertNothingSent();
    }

    /**
     * En cas de timeout réseau (ConnectionException), la soumission doit échouer
     * de manière sécurisée et retourner HTTP 422.
     */
    public function test_submission_fails_on_turnstile_connection_timeout(): void
    {
        Config::set('turnstile.enabled', true);

        Http::fake(function () {
            throw new ConnectionException('cURL error 28: Operation timed out');
        });

        $response = $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => 'valid-token']
        ));

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Vérification CAPTCHA invalide ou expirée.',
                 ]);
    }

    /**
     * Le middleware Turnstile ne doit PAS être appliqué aux routes GET publiques.
     * GET /api/products doit retourner 200 sans aucun token Turnstile.
     */
    public function test_turnstile_not_applied_to_get_product_routes(): void
    {
        Config::set('turnstile.enabled', true);

        Product::factory()->count(2)->create();

        // Aucun token Turnstile dans la requête GET.
        $response = $this->getJson('/api/products');

        // La route doit être accessible sans CAPTCHA.
        $response->assertStatus(200);
    }

    /**
     * Le middleware Turnstile ne doit PAS être appliqué aux routes GET /categories.
     */
    public function test_turnstile_not_applied_to_get_categories_route(): void
    {
        Config::set('turnstile.enabled', true);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
    }

    /**
     * Vérifier l'ordre des middlewares : le Honeypot doit être exécuté AVANT Turnstile.
     * Lorsqu'un bot remplit le champ honeypot, aucun appel réseau Turnstile ne doit
     * être effectué — le shadow block intervient en premier.
     */
    public function test_honeypot_triggers_before_turnstile_no_cloudflare_call(): void
    {
        Config::set('turnstile.enabled', true);
        Config::set('honeypot.enabled', true);
        Config::set('honeypot.shadow_block', true);

        // Configurer Http::fake sans réponse : si Turnstile appelait Cloudflare, le test échouerait.
        Http::fake();

        $payload = array_merge($this->validContactPayload(), [
            'website'              => 'http://spam-link.com', // Déclenche le honeypot
            'cf-turnstile-response' => '',                    // Token absent
        ]);

        $response = $this->postJson('/api/contact', $payload);

        // Le honeypot retourne 201 factice — Turnstile ne doit jamais être atteint.
        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        // Aucun appel réseau vers Cloudflare ne doit avoir été effectué.
        Http::assertNothingSent();

        // Aucune donnée ne doit être en base de données.
        $this->assertDatabaseCount('contacts', 0);
    }

    /**
     * Lorsque Cloudflare retourne une erreur HTTP 500, un warning doit être
     * enregistré dans les logs Laravel avec le statut HTTP.
     */
    public function test_turnstile_logs_warning_on_cloudflare_server_error(): void
    {
        Config::set('turnstile.enabled', true);
        Config::set('turnstile.log_channel', 'stack');

        Http::fake([
            'challenges.cloudflare.com/*' => Http::sequence()->pushStatus(500),
        ]);

        Log::shouldReceive('channel')
            ->with('stack')
            ->andReturnSelf();

        Log::shouldReceive('warning')
            ->atLeast()->once()
            ->withArgs(function (string $message, array $context) {
                return str_contains($message, 'Turnstile')
                    && (
                        isset($context['status'])    // Erreur HTTP non-2xx
                        || isset($context['reason']) // Middleware logFailure
                    );
            });

        // Autoriser les autres appels Log non liés à Turnstile.
        Log::shouldReceive('error')->andReturnNull();
        Log::shouldReceive('info')->andReturnNull();
        Log::shouldReceive('debug')->andReturnNull();

        $this->postJson('/api/contact', array_merge(
            $this->validContactPayload(),
            ['cf-turnstile-response' => 'valid-token']
        ));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Payload valide pour le formulaire Contact (sans token Turnstile).
     *
     * @return array<string, string>
     */
    private function validContactPayload(): array
    {
        return [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'phone'   => '0600000001',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
        ];
    }
}
