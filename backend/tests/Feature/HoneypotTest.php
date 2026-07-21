<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * HoneypotTest
 *
 * Suite de tests dédiée à la protection Honeypot anti-bot.
 *
 * Couvre :
 * - Blocage des formulaires Contact, Avis et Commandes lorsque le champ honeypot est rempli
 * - Passage normal lorsque le champ honeypot est vide ou absent
 * - Comportement lorsque le honeypot est désactivé (HONEYPOT_ENABLED=false)
 * - Vérification que le middleware N'est PAS appliqué sur les routes non protégées
 * - Vérification du logging lors d'une détection de bot
 * - Comportement shadow_block=false (réponse 400 explicite)
 *
 * @see App\Http\Middleware\BlockSpamHoneypot
 * @see config/honeypot.php
 */
class HoneypotTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function validContactPayload(array $override = []): array
    {
        return array_merge([
            'name'    => 'Jean Humain',
            'email'   => 'jean@example.com',
            'phone'   => '0600000001',
            'subject' => 'Demande d\'information',
            'message' => 'Bonjour, j\'ai une question concernant vos produits.',
        ], $override);
    }

    private function validReviewPayload(int $productId, array $override = []): array
    {
        return array_merge([
            'product_id'    => $productId,
            'customer_name' => 'Marie Humaine',
            'rating'        => 4,
            'comment'       => 'Produit de très bonne qualité, je recommande vivement.',
        ], $override);
    }

    private function validOrderPayload(int $productId, array $override = []): array
    {
        return array_merge([
            'customer' => 'Pierre Humain',
            'phone'    => '0600000002',
            'address'  => '42 Rue de la Liberté',
            'city'     => 'Lyon',
            'items'    => [
                ['product_id' => $productId, 'quantity' => 1],
            ],
        ], $override);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Shadow block — Champ honeypot rempli
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lorsqu'un robot remplit le champ honeypot sur le formulaire Contact,
     * le middleware intercepte et retourne une réponse 201 factice.
     * Aucun message ne doit être enregistré en base de données.
     */
    public function test_honeypot_blocks_contact_form_with_shadow_response(): void
    {
        config(['honeypot.enabled' => true, 'honeypot.shadow_block' => true]);

        $response = $this->postJson('/api/contact', $this->validContactPayload([
            'website' => 'http://spam-link.com',
        ]));

        $response->assertStatus(201)->assertJson(['success' => true]);
        $this->assertDatabaseCount('contacts', 0);
    }

    /**
     * Lorsqu'un robot remplit le champ honeypot sur le formulaire Avis,
     * le middleware intercepte et retourne une réponse 201 factice.
     * Aucun avis ne doit être enregistré en base de données.
     */
    public function test_honeypot_blocks_review_form_with_shadow_response(): void
    {
        config(['honeypot.enabled' => true, 'honeypot.shadow_block' => true]);

        $product = Product::factory()->create();

        $response = $this->postJson('/api/reviews', $this->validReviewPayload($product->id, [
            'website' => 'http://spam-link.com',
        ]));

        $response->assertStatus(201)->assertJson(['success' => true]);
        $this->assertDatabaseCount('reviews', 0);
    }

    /**
     * Lorsqu'un robot remplit le champ honeypot sur le formulaire Commande,
     * le middleware intercepte et retourne une réponse 201 factice.
     * Aucune commande ne doit être créée et aucun stock ne doit être décrémenté.
     */
    public function test_honeypot_blocks_order_form_with_shadow_response(): void
    {
        config(['honeypot.enabled' => true, 'honeypot.shadow_block' => true]);

        $product = Product::factory()->create(['stock' => 10, 'price' => 100.00]);

        $response = $this->postJson('/api/orders', $this->validOrderPayload($product->id, [
            'website' => 'http://spam-link.com',
        ]));

        $response->assertStatus(201)->assertJson(['success' => true]);
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);

        $product->refresh();
        $this->assertEquals(10, $product->stock);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Passage normal — Champ honeypot vide ou absent
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lorsque le champ honeypot est présent mais vide (utilisateur humain),
     * la requête doit passer normalement et aboutir à une réponse 201.
     */
    public function test_honeypot_passes_when_field_is_present_but_empty(): void
    {
        config(['honeypot.enabled' => true]);

        $response = $this->postJson('/api/contact', $this->validContactPayload([
            'website' => '',
        ]));

        $response->assertStatus(201)->assertJson(['success' => true]);
        $this->assertDatabaseCount('contacts', 1);
    }

    /**
     * Lorsque le champ honeypot est totalement absent, la requête doit passer normalement.
     */
    public function test_honeypot_passes_when_field_is_absent(): void
    {
        config(['honeypot.enabled' => true]);

        $response = $this->postJson('/api/contact', $this->validContactPayload());

        $response->assertStatus(201)->assertJson(['success' => true]);
        $this->assertDatabaseCount('contacts', 1);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Honeypot désactivé
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lorsque HONEYPOT_ENABLED=false, même un robot qui remplit le champ honeypot
     * peut soumettre normalement (utile pour les tests automatisés CI/CD).
     */
    public function test_honeypot_disabled_allows_bot_submission(): void
    {
        config(['honeypot.enabled' => false]);

        $response = $this->postJson('/api/contact', $this->validContactPayload([
            'website' => 'http://spam-link.com',
        ]));

        $response->assertStatus(201)->assertJson(['success' => true]);
        $this->assertDatabaseCount('contacts', 1);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Scope du middleware
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Les routes publiques GET (produits) ne sont pas protégées par le middleware Honeypot.
     */
    public function test_honeypot_not_applied_to_public_product_routes(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200);
    }

    /**
     * La route GET /categories n'est pas protégée par Honeypot.
     */
    public function test_honeypot_not_applied_to_categories_route(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
    }

    /**
     * La route GET /reviews (liste publique) n'est pas protégée par Honeypot.
     */
    public function test_honeypot_not_applied_to_get_reviews_route(): void
    {
        $response = $this->getJson('/api/reviews');

        $response->assertStatus(200);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Logging
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lors de la détection d'un bot, un warning doit être enregistré dans les logs
     * Laravel avec les informations : IP, User-Agent, URL et timestamp.
     */
    public function test_honeypot_logs_warning_on_bot_detection(): void
    {
        config(['honeypot.enabled' => true, 'honeypot.log_channel' => 'stack']);

        Log::shouldReceive('channel')
            ->once()
            ->with('stack')
            ->andReturnSelf();

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function (string $message, array $context) {
                return str_contains($message, 'Bot détecté')
                    && isset($context['ip'])
                    && isset($context['user_agent'])
                    && isset($context['route'])
                    && isset($context['timestamp']);
            });

        $this->postJson('/api/contact', $this->validContactPayload([
            'website' => 'http://spam-link.com',
        ]));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6. Shadow block désactivé
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lorsque shadow_block=false, le middleware retourne une réponse d'erreur 400
     * au lieu de la réponse factice 201.
     */
    public function test_honeypot_returns_error_when_shadow_block_disabled(): void
    {
        config([
            'honeypot.enabled'       => true,
            'honeypot.shadow_block'  => false,
            'honeypot.error_message' => 'Requête invalide.',
        ]);

        $response = $this->postJson('/api/contact', $this->validContactPayload([
            'website' => 'http://spam-link.com',
        ]));

        $response->assertStatus(400)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Requête invalide.',
                 ]);

        $this->assertDatabaseCount('contacts', 0);
    }
}
