<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de création d'une commande réussie.
     */
    public function test_can_place_order_successfully(): void
    {
        $product1 = Product::factory()->create(['stock' => 10, 'price' => 100.00]);
        $product2 = Product::factory()->create(['stock' => 5, 'price' => 50.00]);

        $payload = [
            'customer' => 'Jean Dupont',
            'phone'    => '0612345678',
            'address'  => '123 Rue de la Paix',
            'city'     => 'Paris',
            'items'    => [
                [
                    'product_id' => $product1->id,
                    'quantity'   => 2,
                ],
                [
                    'product_id' => $product2->id,
                    'quantity'   => 1,
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Commande créée avec succès.',
                     'data' => [
                         'customer_name' => 'Jean Dupont',
                         'phone'         => '0612345678',
                         'address'       => '123 Rue de la Paix',
                         'city'          => 'Paris',
                         'total_price'   => '250.00', // (2 * 100) + (1 * 50) = 250
                         'status'        => 'En attente',
                     ]
                 ]);

        // Vérifier que le stock des produits a été décrémenté
        $product1->refresh();
        $product2->refresh();
        $this->assertEquals(8, $product1->stock);
        $this->assertEquals(4, $product2->stock);

        // Vérifier que la commande et ses lignes sont bien en BDD
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Jean Dupont',
            'total_price'   => 250.00,
        ]);

        $this->assertDatabaseCount('order_items', 2);
    }

    /**
     * Test de refus de commande si un produit n'a pas assez de stock.
     */
    public function test_cannot_place_order_if_insufficient_stock(): void
    {
        $product = Product::factory()->create(['stock' => 2, 'price' => 100.00]);

        $payload = [
            'customer' => 'Jean Dupont',
            'phone'    => '0612345678',
            'address'  => '123 Rue de la Paix',
            'city'     => 'Paris',
            'items'    => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 5, // Demande 5 alors que le stock est de 2
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(409)
                 ->assertJson([
                     'success' => false,
                     'message' => "Le stock est insuffisant pour le produit : {$product->name}",
                 ]);

        // Vérifier que le stock n'a pas bougé et qu'aucune commande n'a été créée
        $product->refresh();
        $this->assertEquals(2, $product->stock);
        $this->assertDatabaseCount('orders', 0);
    }

    /**
     * Test d'atomicité de la transaction SQL : si un article de commande échoue par manque de stock,
     * aucun autre article ne doit être décrémenté et la commande ne doit pas être enregistrée (Rollback).
     */
    public function test_order_transaction_rolls_back_on_failure(): void
    {
        $product1 = Product::factory()->create(['stock' => 10, 'price' => 100.00]);
        $product2 = Product::factory()->create(['stock' => 2, 'price' => 50.00]);

        $payload = [
            'customer' => 'Jean Dupont',
            'phone'    => '0612345678',
            'address'  => '123 Rue de la Paix',
            'city'     => 'Paris',
            'items'    => [
                [
                    'product_id' => $product1->id,
                    'quantity'   => 5, // Valide (10 dispo)
                ],
                [
                    'product_id' => $product2->id,
                    'quantity'   => 5, // Invalide (seulement 2 dispo) -> Doit provoquer l'échec et le rollback
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(409);

        // Vérifier que tout a été rollback
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);

        // Les stocks ne doivent pas avoir bougé
        $product1->refresh();
        $product2->refresh();
        $this->assertEquals(10, $product1->stock);
        $this->assertEquals(2, $product2->stock);
    }

    /**
     * Test d'échec de commande si le produit n'existe pas.
     */
    public function test_cannot_place_order_if_product_not_found(): void
    {
        $payload = [
            'customer' => 'Jean Dupont',
            'phone'    => '0612345678',
            'address'  => '123 Rue de la Paix',
            'city'     => 'Paris',
            'items'    => [
                [
                    'product_id' => 9999, // Produit inexistant
                    'quantity'   => 1,
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $payload);

        // Comme la validation avec `exists:products,id` dans StoreOrderRequest passe en premier,
        // cela retourne un code HTTP 422 avec un message de validation failed.
        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation failed',
                 ]);
    }

    /**
     * Test de la protection anti-spam Honeypot sur le formulaire de commande.
     * Le middleware retourne une fausse réponse de succès HTTP 201 (shadow block).
     * Aucune commande ne doit être créée et aucun stock ne doit être décrémenté.
     */
    public function test_order_honeypot_blocks_submission(): void
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 100.00]);

        $payload = [
            'customer' => 'Bot Spammer',
            'phone'    => '0600000000',
            'address'  => '1 Rue du Spam',
            'city'     => 'Spamville',
            'website'  => 'http://spam-link.com', // Remplir ce champ simule un robot
            'items'    => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $payload);

        // Le middleware retourne une fausse réponse de succès pour ne pas alerter le robot
        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                 ]);

        // Aucune commande ne doit être créée
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);

        // Le stock ne doit pas avoir bougé
        $product->refresh();
        $this->assertEquals(10, $product->stock);
    }
}
