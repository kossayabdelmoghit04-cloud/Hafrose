<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * Suite de tests Rate Limiting — Phase 4.3 HAFROSE
 *
 * Couvre :
 *  - Requêtes autorisées sous la limite (< max) → 200/201
 *  - Dépassement de la limite → HTTP 429
 *  - Remise à zéro après expiration (clear)
 *  - Indépendance entre IPs différentes
 *  - Indépendance entre utilisateurs différents (wishlist)
 *
 * Rate Limiters testés :
 *  contact     → 5 req/min par IP
 *  reviews     → 10 req/min par IP
 *  orders      → 20 req/min par IP
 *  wishlist    → 30 req/min par user_id
 *  admin-login → 5 req/min par IP
 *  api         → 60 req/min par IP/user
 */
class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /** Vide tous les compteurs de rate limiting avant chaque test. */
    protected function setUp(): void
    {
        parent::setUp();
        // Le cache array se réinitialise à chaque test, pas de nettoyage requis.
    }

    private function validContactPayload(string $suffix = ''): array
    {
        return [
            'name'    => 'Test User' . $suffix,
            'email'   => "test{$suffix}@example.com",
            'subject' => 'Sujet de test',
            'message' => 'Bonjour, voici un message de test suffisamment long.',
        ];
    }

    private function validReviewPayload(int $productId): array
    {
        return [
            'product_id'    => $productId,
            'customer_name' => 'Jean Dupont',
            'rating'        => 5,
            'comment'       => 'Ce produit est absolument fantastique et je le recommande vivement.',
        ];
    }

    private function validOrderPayload(int $productId): array
    {
        return [
            'customer' => 'Jean Dupont',
            'phone'    => '0612345678',
            'address'  => '123 Rue de la Paix',
            'city'     => 'Paris',
            'items'    => [
                ['product_id' => $productId, 'quantity' => 1],
            ],
        ];
    }

    private function createUser(string $role = 'customer'): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email'    => 'admin@hafrose.com',
            'password' => bcrypt('Admin@Hafrose2024!'),
            'role'     => User::ROLE_ADMIN,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Contact (throttle:contact → 5 req/min par IP)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Les 5 premières requêtes contact doivent être acceptées (201).
     */
    public function test_contact_allows_requests_under_limit(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/contact', $this->validContactPayload((string) $i));
            $response->assertStatus(201);
        }
    }

    /**
     * La 6ème requête contact doit être rejetée avec HTTP 429.
     */
    public function test_contact_returns_429_when_limit_exceeded(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $this->validContactPayload((string) $i));
        }

        $response = $this->postJson('/api/contact', $this->validContactPayload('overflow'));

        $response->assertStatus(429)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Too many requests',
                     'errors'  => null,
                     'data'    => null,
                 ]);
    }

    /**
     * Après réinitialisation du compteur, les requêtes sont à nouveau acceptées.
     */
    public function test_contact_rate_limit_resets_after_clear(): void
    {
        // Épuiser la limite
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $this->validContactPayload((string) $i));
        }
        $this->postJson('/api/contact', $this->validContactPayload('overflow'))
             ->assertStatus(429);

        // Simuler l'expiration de la fenêtre en vidant le compteur
        RateLimiter::clear(md5('contact127.0.0.1'));

        // La requête doit à nouveau passer
        $response = $this->postJson('/api/contact', $this->validContactPayload('after_reset'));
        $response->assertStatus(201);
    }

    /**
     * Deux IPs différentes ont des compteurs indépendants.
     */
    public function test_contact_rate_limit_is_per_ip(): void
    {
        // Épuiser la limite depuis 127.0.0.1
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $this->validContactPayload((string) $i));
        }
        $this->postJson('/api/contact', $this->validContactPayload('overflow'))
             ->assertStatus(429);

        // Depuis une autre IP, la requête doit passer
        $response = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])
                         ->postJson('/api/contact', $this->validContactPayload('other_ip'));
        $response->assertStatus(201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Reviews (throttle:reviews → 10 req/min par IP)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Les 10 premières soumissions d'avis sont acceptées.
     */
    public function test_reviews_allows_requests_under_limit(): void
    {
        $products = Product::factory()->count(10)->create();

        for ($i = 0; $i < 10; $i++) {
            $response = $this->postJson('/api/reviews', $this->validReviewPayload($products[$i]->id));
            $response->assertStatus(201);
        }
    }

    /**
     * La 11ème soumission d'avis retourne HTTP 429.
     */
    public function test_reviews_returns_429_when_limit_exceeded(): void
    {
        $products = Product::factory()->count(11)->create();

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/reviews', $this->validReviewPayload($products[$i]->id));
        }

        $response = $this->postJson('/api/reviews', $this->validReviewPayload($products[10]->id));
        $response->assertStatus(429)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Too many requests',
                 ]);
    }

    /**
     * Après réinitialisation, les soumissions d'avis sont à nouveau acceptées.
     */
    public function test_reviews_rate_limit_resets_after_clear(): void
    {
        $products = Product::factory()->count(11)->create();

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/reviews', $this->validReviewPayload($products[$i]->id));
        }
        $this->postJson('/api/reviews', $this->validReviewPayload($products[10]->id))
             ->assertStatus(429);

        RateLimiter::clear(md5('reviews127.0.0.1'));

        $extra = Product::factory()->create();
        $this->postJson('/api/reviews', $this->validReviewPayload($extra->id))
             ->assertStatus(201);
    }

    /**
     * Deux IPs ont des compteurs reviews indépendants.
     */
    public function test_reviews_rate_limit_is_per_ip(): void
    {
        $products = Product::factory()->count(11)->create();

        // Épuiser la limite depuis l'IP par défaut
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/reviews', $this->validReviewPayload($products[$i]->id));
        }
        $this->postJson('/api/reviews', $this->validReviewPayload($products[10]->id))
             ->assertStatus(429);

        // Depuis une autre IP, l'avis doit passer
        $extra = Product::factory()->create();
        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
             ->postJson('/api/reviews', $this->validReviewPayload($extra->id))
             ->assertStatus(201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Orders (throttle:orders → 20 req/min par IP)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Les 20 premières commandes sont acceptées.
     */
    public function test_orders_allows_requests_under_limit(): void
    {
        // On crée 20 produits avec suffisamment de stock
        $products = Product::factory()->count(20)->create(['stock' => 50, 'price' => 10.00]);

        for ($i = 0; $i < 20; $i++) {
            $response = $this->postJson('/api/orders', $this->validOrderPayload($products[$i]->id));
            $response->assertStatus(201);
        }
    }

    /**
     * La 21ème commande retourne HTTP 429.
     */
    public function test_orders_returns_429_when_limit_exceeded(): void
    {
        $products = Product::factory()->count(21)->create(['stock' => 50, 'price' => 10.00]);

        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/orders', $this->validOrderPayload($products[$i]->id));
        }

        $response = $this->postJson('/api/orders', $this->validOrderPayload($products[20]->id));
        $response->assertStatus(429)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Too many requests',
                 ]);
    }

    /**
     * Après réinitialisation, les commandes sont à nouveau acceptées.
     */
    public function test_orders_rate_limit_resets_after_clear(): void
    {
        $products = Product::factory()->count(21)->create(['stock' => 50, 'price' => 10.00]);

        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/orders', $this->validOrderPayload($products[$i]->id));
        }
        $this->postJson('/api/orders', $this->validOrderPayload($products[20]->id))
             ->assertStatus(429);

        RateLimiter::clear(md5('orders127.0.0.1'));

        $extra = Product::factory()->create(['stock' => 50, 'price' => 10.00]);
        $this->postJson('/api/orders', $this->validOrderPayload($extra->id))
             ->assertStatus(201);
    }

    /**
     * Deux IPs ont des compteurs commandes indépendants.
     */
    public function test_orders_rate_limit_is_per_ip(): void
    {
        $products = Product::factory()->count(21)->create(['stock' => 50, 'price' => 10.00]);

        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/orders', $this->validOrderPayload($products[$i]->id));
        }
        $this->postJson('/api/orders', $this->validOrderPayload($products[20]->id))
             ->assertStatus(429);

        $extra = Product::factory()->create(['stock' => 50, 'price' => 10.00]);
        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.3'])
             ->postJson('/api/orders', $this->validOrderPayload($extra->id))
             ->assertStatus(201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Wishlist (throttle:wishlist → 30 req/min par user_id)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Les 30 premières actions wishlist d'un utilisateur connecté sont acceptées.
     * On utilise uniquement l'action GET (check) pour éviter l'effet doublon.
     */
    public function test_wishlist_allows_requests_under_limit(): void
    {
        $user    = $this->createUser();
        $token   = $user->createToken('token')->plainTextToken;
        $product = Product::factory()->create();

        // Vidage du compteur de cet utilisateur
        RateLimiter::clear('wishlist|' . $user->id);

        for ($i = 0; $i < 30; $i++) {
            $response = $this->withToken($token)
                             ->getJson("/api/wishlist/check/{$product->id}");
            $response->assertStatus(200);
        }
    }

    /**
     * La 31ème action wishlist retourne HTTP 429.
     */
    public function test_wishlist_returns_429_when_limit_exceeded(): void
    {
        $user    = $this->createUser();
        $token   = $user->createToken('token')->plainTextToken;
        $product = Product::factory()->create();

        RateLimiter::clear('wishlist|' . $user->id);

        for ($i = 0; $i < 30; $i++) {
            $this->withToken($token)->getJson("/api/wishlist/check/{$product->id}");
        }

        $response = $this->withToken($token)->getJson("/api/wishlist/check/{$product->id}");
        $response->assertStatus(429)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Too many requests',
                 ]);
    }

    /**
     * Après réinitialisation du compteur, les actions wishlist sont acceptées.
     */
    public function test_wishlist_rate_limit_resets_after_clear(): void
    {
        $user    = $this->createUser();
        $token   = $user->createToken('token')->plainTextToken;
        $product = Product::factory()->create();

        RateLimiter::clear('wishlist|' . $user->id);

        for ($i = 0; $i < 30; $i++) {
            $this->withToken($token)->getJson("/api/wishlist/check/{$product->id}");
        }
        $this->withToken($token)->getJson("/api/wishlist/check/{$product->id}")
             ->assertStatus(429);

        RateLimiter::clear(md5('wishlist' . $user->id));

        $this->withToken($token)->getJson("/api/wishlist/check/{$product->id}")
             ->assertStatus(200);
    }

    /**
     * Deux utilisateurs ont des compteurs wishlist indépendants.
     */
    public function test_wishlist_rate_limit_is_per_user(): void
    {
        $userA   = $this->createUser();
        $userB   = $this->createUser();
        $tokenA  = $userA->createToken('tokenA')->plainTextToken;
        $tokenB  = $userB->createToken('tokenB')->plainTextToken;
        $product = Product::factory()->create();

        RateLimiter::clear('wishlist|' . $userA->id);
        RateLimiter::clear('wishlist|' . $userB->id);

        // Épuiser la limite de userA
        for ($i = 0; $i < 30; $i++) {
            $this->withToken($tokenA)->getJson("/api/wishlist/check/{$product->id}");
        }
        $this->withToken($tokenA)->getJson("/api/wishlist/check/{$product->id}")
             ->assertStatus(429);

        // Oublier les guards pour forcer la ré-authentification avec le token de userB
        $this->app['auth']->forgetGuards();

        // userB a son propre compteur → doit passer
        $this->withToken($tokenB)->getJson("/api/wishlist/check/{$product->id}")
             ->assertStatus(200);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Admin Login (throttle:admin-login → 5 req/min par IP)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Les 5 premières tentatives de connexion admin (même échouées) sont traitées.
     * On teste avec des identifiants incorrects pour ne pas créer de session.
     */
    public function test_admin_login_allows_requests_under_limit(): void
    {
        $this->createAdmin();

        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/admin/login', [
                'email'    => 'admin@hafrose.com',
                'password' => 'wrong_password_' . $i,
            ]);
            // 401 est une réponse légitime (mauvais mdp) — pas un 429
            $response->assertStatus(401);
        }
    }

    /**
     * La 6ème tentative de connexion admin retourne HTTP 429.
     */
    public function test_admin_login_returns_429_when_limit_exceeded(): void
    {
        $this->createAdmin();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', [
                'email'    => 'admin@hafrose.com',
                'password' => 'wrong_password_' . $i,
            ]);
        }

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'Admin@Hafrose2024!',
        ]);

        $response->assertStatus(429)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Too many requests',
                 ]);
    }

    /**
     * Après réinitialisation du compteur, la connexion admin est de nouveau possible.
     */
    public function test_admin_login_rate_limit_resets_after_clear(): void
    {
        $this->createAdmin();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', [
                'email'    => 'admin@hafrose.com',
                'password' => 'wrong_' . $i,
            ]);
        }
        $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'Admin@Hafrose2024!',
        ])->assertStatus(429);

        RateLimiter::clear(md5('admin-login127.0.0.1'));

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'Admin@Hafrose2024!',
        ]);
        $response->assertStatus(200);
    }

    /**
     * Deux IPs ont des compteurs admin-login indépendants.
     */
    public function test_admin_login_rate_limit_is_per_ip(): void
    {
        $this->createAdmin();

        // Épuiser depuis 127.0.0.1
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', [
                'email'    => 'admin@hafrose.com',
                'password' => 'wrong_' . $i,
            ]);
        }
        $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'wrong',
        ])->assertStatus(429);

        // Depuis une autre IP, la connexion réussit
        $response = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.4'])
                         ->postJson('/api/admin/login', [
                             'email'    => 'admin@hafrose.com',
                             'password' => 'Admin@Hafrose2024!',
                         ]);
        $response->assertStatus(200);
    }
}
