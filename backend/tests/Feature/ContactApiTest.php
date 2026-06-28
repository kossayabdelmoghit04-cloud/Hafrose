<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de soumission du message de contact avec succès.
     */
    public function test_can_submit_contact_message(): void
    {
        $payload = [
            'name'    => 'Marie Martin',
            'email'   => 'marie.martin@example.com',
            'phone'   => '0678901234',
            'subject' => 'Demande de partenariat',
            'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Message de contact envoyé avec succès.',
                     'data' => [
                         'name'    => 'Marie Martin',
                         'email'   => 'marie.martin@example.com',
                         'phone'   => '0678901234',
                         'subject' => 'Demande de partenariat',
                         'message' => 'Bonjour, j\'aimerais collaborer avec votre marque.',
                     ]
                 ]);

        $this->assertDatabaseHas('contacts', [
            'name'  => 'Marie Martin',
            'email' => 'marie.martin@example.com',
        ]);
    }

    /**
     * Test de la protection anti-spam Honeypot (le champ website doit être vide).
     */
    public function test_contact_honeypot_blocks_submission(): void
    {
        $payload = [
            'name'    => 'Spammer Bot',
            'email'   => 'bot@spam.com',
            'subject' => 'Achetez mes produits',
            'message' => 'Bonjour, voici un lien malveillant...',
            'website' => 'http://spam-link.com', // Remplir ce champ simule un robot
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation failed',
                 ])
                 ->assertJsonValidationErrors(['website']);
    }

    /**
     * Test de validation stricte sur les champs obligatoires du formulaire de contact.
     */
    public function test_contact_validation_fails(): void
    {
        $response = $this->postJson('/api/contact', [
            'email' => 'email-invalide',
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation failed',
                 ])
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'errors' => [
                         'name',
                         'email',
                         'subject',
                         'message',
                     ]
                 ]);
    }

    /**
     * Test du rate limiter strict sur le formulaire de contact (max 5 requêtes par minute).
     */
    public function test_contact_rate_limiting(): void
    {
        // Envoi de 5 requêtes acceptées
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/contact', [
                'name'    => 'Marie Test',
                'email'   => "test{$i}@example.com",
                'subject' => 'Sujet de test',
                'message' => 'Bonjour, voici un message de test assez long.',
            ]);
            $response->assertStatus(201);
        }

        // La 6ème requête doit être rejetée avec le code HTTP 429
        $response = $this->postJson('/api/contact', [
            'name'    => 'Marie Test',
            'email'   => 'test.overflow@example.com',
            'subject' => 'Sujet de test',
            'message' => 'Bonjour, voici un message de test assez long.',
        ]);

        $response->assertStatus(429)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Too many requests',
                     'errors'  => null,
                     'data'    => null,
                 ]);
    }
}
