<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistApiTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(): User
    {
        return User::factory()->create([
            'role' => 'customer',
        ]);
    }

    private function createTokenForUser(User $user): string
    {
        return $user->createToken('user-token')->plainTextToken;
    }

    /**
     * Test qu'un utilisateur non connecté ne peut pas consulter sa wishlist.
     */
    public function test_unauthenticated_user_cannot_access_wishlist(): void
    {
        $response = $this->getJson('/api/wishlist');

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Unauthenticated',
                     'errors'  => null,
                     'data'    => null,
                 ]);
    }

    /**
     * Test qu'un utilisateur connecté peut récupérer sa wishlist (vide au départ).
     */
    public function test_authenticated_user_can_get_empty_wishlist(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);

        $response = $this->withToken($token)->getJson('/api/wishlist');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => null,
                     'errors'  => null,
                     'data'    => [],
                 ]);
    }

    /**
     * Test qu'un utilisateur connecté peut ajouter un produit à sa wishlist.
     */
    public function test_authenticated_user_can_add_product_to_wishlist(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);
        $product = Product::factory()->create();

        $response = $this->withToken($token)->postJson('/api/wishlist', [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'id',
                         'user_id',
                         'product' => [
                             'id',
                             'name',
                             'slug',
                             'price',
                         ],
                         'category',
                         'gallery_principale',
                     ],
                 ]);

        $this->assertDatabaseHas('wishlist_items', [
            'user_id'    => $user->id,
            'product_id' => $product->id,
        ]);
    }

    /**
     * Test qu'un doublon est refusé par la validation.
     */
    public function test_duplicate_wishlist_item_is_refused(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);
        $product = Product::factory()->create();

        // Ajout du premier
        WishlistItem::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
        ]);

        // Essai d'ajout d'un doublon
        $response = $this->withToken($token)->postJson('/api/wishlist', [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation failed',
                 ])
                 ->assertJsonValidationErrors(['product_id']);
    }

    /**
     * Test qu'un utilisateur connecté peut récupérer sa wishlist avec ses favoris.
     */
    public function test_authenticated_user_can_retrieve_favorites(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);
        
        $item1 = WishlistItem::factory()->create(['user_id' => $user->id]);
        $item2 = WishlistItem::factory()->create(['user_id' => $user->id]);

        $response = $this->withToken($token)->getJson('/api/wishlist');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    /**
     * Test de vérification de favori (is_favorite).
     */
    public function test_can_check_if_product_is_favorite(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

        // Ajouter product1 aux favoris
        WishlistItem::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product1->id,
        ]);

        // Vérifier product1
        $response1 = $this->withToken($token)->getJson("/api/wishlist/check/{$product1->id}");
        $response1->assertStatus(200)
                  ->assertJsonPath('data.is_favorite', true);

        // Vérifier product2 (pas en favori)
        $response2 = $this->withToken($token)->getJson("/api/wishlist/check/{$product2->id}");
        $response2->assertStatus(200)
                  ->assertJsonPath('data.is_favorite', false);
    }

    /**
     * Test de suppression d'un favori.
     */
    public function test_authenticated_user_can_delete_favorite(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);
        $product = Product::factory()->create();

        WishlistItem::factory()->create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->withToken($token)->deleteJson("/api/wishlist/{$product->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('wishlist_items', [
            'user_id'    => $user->id,
            'product_id' => $product->id,
        ]);
    }

    /**
     * Test que la suppression d'un favori inexistant retourne 404.
     */
    public function test_deleting_nonexistent_favorite_returns_404(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);
        $product = Product::factory()->create();

        // Le produit existe, mais n'est pas dans la wishlist
        $response = $this->withToken($token)->deleteJson("/api/wishlist/{$product->id}");

        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Resource not found',
                 ]);
    }

    /**
     * Test que la suppression d'un produit inexistant dans la base retourne 404.
     */
    public function test_deleting_nonexistent_product_in_db_returns_404(): void
    {
        $user = $this->createUser();
        $token = $this->createTokenForUser($user);

        $response = $this->withToken($token)->deleteJson('/api/wishlist/999999');

        $response->assertStatus(404)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Resource not found',
                 ]);
    }

    /**
     * Test qu'un utilisateur ne peut pas accéder à la wishlist d'un autre utilisateur.
     */
    public function test_user_cannot_access_other_users_wishlist(): void
    {
        $userA = $this->createUser();
        $userB = $this->createUser();
        $tokenB = $this->createTokenForUser($userB);
        
        $product = Product::factory()->create();

        // User A ajoute un produit
        WishlistItem::factory()->create([
            'user_id'    => $userA->id,
            'product_id' => $product->id,
        ]);

        // User B consulte sa propre wishlist -> vide
        $responseGet = $this->withToken($tokenB)->getJson('/api/wishlist');
        $responseGet->assertStatus(200)
                    ->assertJsonCount(0, 'data');

        // User B tente de supprimer le favori de User A -> doit retourner 404 car inexistant pour User B
        $responseDelete = $this->withToken($tokenB)->deleteJson("/api/wishlist/{$product->id}");
        $responseDelete->assertStatus(404);

        // Le favori de User A est toujours présent en BDD
        $this->assertDatabaseHas('wishlist_items', [
            'user_id'    => $userA->id,
            'product_id' => $product->id,
        ]);
    }
}
