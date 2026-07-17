<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de récupération de tous les avis approuvés.
     */
    public function test_can_get_approved_reviews(): void
    {
        // Avis approuvé
        Review::factory()->create([
            'is_approved' => true,
            'comment'     => 'Avis approuvé',
        ]);

        // Avis non approuvé (ne doit pas être retourné par la liste publique générale)
        Review::factory()->create([
            'is_approved' => false,
            'comment'     => 'Avis en attente',
        ]);

        $response = $this->getJson('/api/reviews');

        $response->assertStatus(200);
        $this->assertCount(1, $response['data']);
        $this->assertEquals('Avis approuvé', $response['data'][0]['comment']);
    }

    /**
     * Test d'envoi d'un nouvel avis avec validation réussie.
     */
    public function test_can_submit_new_review_as_unapproved(): void
    {
        $product = Product::factory()->create();

        $payload = [
            'product_id'    => $product->id,
            'customer_name' => 'Jean Dupont',
            'rating'        => 5,
            'comment'       => 'Ce produit est absolument fantastique et je le recommande vivement.',
        ];

        $response = $this->postJson('/api/reviews', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Avis créé avec succès, en attente d\'approbation.',
                 ]);

        // Vérifier l'insertion dans la base de données avec is_approved = false
        $this->assertDatabaseHas('reviews', [
            'product_id'    => $product->id,
            'customer_name' => 'Jean Dupont',
            'rating'        => 5,
            'comment'       => 'Ce produit est absolument fantastique et je le recommande vivement.',
            'is_approved'   => false,
        ]);
    }

    /**
     * Test de validation sur l'envoi d'un avis invalide.
     */
    public function test_review_validation_fails(): void
    {
        // Envoi d'un payload vide pour déclencher les erreurs de validation
        $response = $this->postJson('/api/reviews', []);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation failed',
                 ])
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors' => [
                         'product_id',
                         'customer_name',
                         'rating',
                         'comment',
                     ],
                     'data',
                 ]);
    }

    /**
     * Test de la protection anti-spam Honeypot sur le formulaire d'avis.
     * Le middleware retourne une fausse réponse de succès HTTP 201 (shadow block).
     * Aucun avis ne doit être écrit en base de données.
     */
    public function test_review_honeypot_blocks_submission(): void
    {
        $product = Product::factory()->create();

        $payload = [
            'product_id'    => $product->id,
            'customer_name' => 'Bot Spammer',
            'rating'        => 5,
            'comment'       => 'Acheter mes produits maintenant, visitez mon site!',
            'website'       => 'http://spam-link.com', // Remplir ce champ simule un robot
        ];

        $response = $this->postJson('/api/reviews', $payload);

        // Le middleware retourne une fausse réponse de succès pour ne pas alerter le robot
        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                 ]);

        // Aucun avis ne doit être écrit en base de données
        $this->assertDatabaseCount('reviews', 0);
    }
}
