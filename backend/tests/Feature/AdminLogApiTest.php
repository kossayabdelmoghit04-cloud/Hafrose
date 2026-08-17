<?php

namespace Tests\Feature;

use App\Models\AdminLog;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\AdminLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLogApiTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::firstOrCreate(
            ['email' => 'admin@hafrose.com'],
            ['name' => 'Admin User', 'password' => bcrypt('password'), 'role' => User::ROLE_ADMIN]
        );
    }

    private function createCustomer(): User
    {
        return User::factory()->create([
            'role' => 'customer',
        ]);
    }

    /**
     * Test de génération de log lors de la création d'un produit par un admin.
     */
    public function test_creating_product_generates_admin_log(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;
        $category = Category::factory()->create();

        $response = $this->withToken($token)->postJson('/api/admin/products', [
            'category_id' => $category->id,
            'name' => 'Montre Chrono Or',
            'slug' => 'montre-chrono-or',
            'description' => 'Une montre d\'exception.',
            'short_description' => 'Montre de luxe.',
            'price' => 4990.00,
            'stock' => 5,
        ]);

        $response->assertCreated();

        $productId = $response->json('data.id');

        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_CREATE,
            'resource' => AdminLog::RESOURCE_PRODUCT,
            'resource_id' => $productId,
        ]);

        $log = AdminLog::where('resource_id', $productId)->where('action', AdminLog::ACTION_CREATE)->first();
        $this->assertNotNull($log);
        $this->assertStringContainsString('Montre Chrono Or', $log->description);
        $this->assertEquals('POST', $log->method);
        $this->assertNotNull($log->ip_address);
    }

    /**
     * Test de génération de log lors de la modification d'un produit.
     */
    public function test_updating_product_generates_admin_log_with_old_and_new_values(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;
        $product = Product::factory()->create(['name' => 'Montre Classique', 'price' => 1000.00]);

        $response = $this->withToken($token)->postJson("/api/admin/products/{$product->id}", [
            'category_id' => $product->category_id,
            'name' => 'Montre Classique Édition Limitée',
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => 1200.00,
            'stock' => $product->stock,
        ]);

        $response->assertOk();

        $log = AdminLog::where('resource_id', $product->id)->where('action', AdminLog::ACTION_UPDATE)->first();
        $this->assertNotNull($log);
        $this->assertEquals('Montre Classique', $log->old_values['name']);
        $this->assertEquals('Montre Classique Édition Limitée', $log->new_values['name']);
    }

    /**
     * Test de génération de log lors du changement de statut d'une commande.
     */
    public function test_updating_order_status_generates_admin_log(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $order = Order::create([
            'customer_name' => 'Client Test',
            'phone' => '0600000000',
            'address' => '10 Rue de Paris',
            'city' => 'Paris',
            'total_price' => 500.00,
            'status' => Order::STATUS_PENDING,
        ]);

        $response = $this->withToken($token)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => Order::STATUS_CONFIRMED,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_STATUS_CHANGE,
            'resource' => AdminLog::RESOURCE_ORDER,
            'resource_id' => $order->id,
        ]);

        $log = AdminLog::where('resource', AdminLog::RESOURCE_ORDER)->where('resource_id', $order->id)->first();
        $this->assertEquals(Order::STATUS_PENDING, $log->old_values['status']);
        $this->assertEquals(Order::STATUS_CONFIRMED, $log->new_values['status']);
    }

    /**
     * Test de génération de log lors de l'approbation d'un avis.
     */
    public function test_approving_review_generates_admin_log(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;
        $review = Review::factory()->create(['is_approved' => false]);

        $response = $this->withToken($token)->patchJson("/api/admin/reviews/{$review->id}/approve");

        $response->assertOk();

        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_APPROVE,
            'resource' => AdminLog::RESOURCE_REVIEW,
            'resource_id' => $review->id,
        ]);
    }

    /**
     * Test de consultation de la liste des logs par un administrateur avec pagination et meta.
     */
    public function test_admin_can_list_logs_with_pagination(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        AdminLog::factory()->count(20)->create(['admin_id' => $admin->id]);

        $response = $this->withToken($token)->getJson('/api/admin/logs?per_page=10&page=1');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    '*' => [
                        'id',
                        'admin',
                        'admin_id',
                        'action',
                        'resource',
                        'resource_type',
                        'resource_id',
                        'description',
                        'old_values',
                        'new_values',
                        'ip_address',
                        'user_agent',
                        'url',
                        'method',
                        'created_at',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);

        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    /**
     * Test des filtres par action, ressource et recherche.
     */
    public function test_admin_can_filter_and_search_logs(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_CREATE,
            'resource' => AdminLog::RESOURCE_PRODUCT,
            'description' => 'Création du produit d\'exception Hafrose Royal',
        ]);

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_DELETE,
            'resource' => AdminLog::RESOURCE_CATEGORY,
            'description' => 'Suppression de la catégorie Ancienne',
        ]);

        // Filtrer par action create
        $resAction = $this->withToken($token)->getJson('/api/admin/logs?action=create');
        $resAction->assertOk();
        $this->assertCount(1, $resAction->json('data'));
        $this->assertEquals(AdminLog::ACTION_CREATE, $resAction->json('data.0.action'));

        // Filtrer par ressource product
        $resResource = $this->withToken($token)->getJson('/api/admin/logs?resource=product');
        $resResource->assertOk();
        $this->assertCount(1, $resResource->json('data'));
        $this->assertEquals(AdminLog::RESOURCE_PRODUCT, $resResource->json('data.0.resource'));

        // Recherche par terme "Hafrose Royal"
        $resSearch = $this->withToken($token)->getJson('/api/admin/logs?search=Hafrose+Royal');
        $resSearch->assertOk();
        $this->assertCount(1, $resSearch->json('data'));
    }

    /**
     * Test de détails d'un log spécifique via l'API.
     */
    public function test_admin_can_view_single_log_details(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $log = AdminLog::create([
            'admin_id' => $admin->id,
            'action' => AdminLog::ACTION_UPDATE,
            'resource' => AdminLog::RESOURCE_SETTING,
            'description' => 'Mise à jour des paramètres du site',
            'old_values' => ['site_name' => 'Hafrose Old'],
            'new_values' => ['site_name' => 'Hafrose New'],
        ]);

        $response = $this->withToken($token)->getJson("/api/admin/logs/{$log->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'action' => AdminLog::ACTION_UPDATE,
                    'resource' => AdminLog::RESOURCE_SETTING,
                    'description' => 'Mise à jour des paramètres du site',
                ],
            ]);
    }

    /**
     * Test d'accès refusé pour les utilisateurs non-administrateurs (clients ou non-authentifiés).
     */
    public function test_non_admin_users_cannot_access_logs(): void
    {
        // 1. Utilisateur non authentifié
        $unauthRes = $this->getJson('/api/admin/logs');
        $unauthRes->assertUnauthorized();

        // 2. Client ordinaire
        $customer = $this->createCustomer();
        $token = $customer->createToken('customer-token')->plainTextToken;

        $customerRes = $this->withToken($token)->getJson('/api/admin/logs');
        $customerRes->assertForbidden();
    }

    /**
     * Test d'immuabilité : aucune modification ni suppression de log via l'API.
     */
    public function test_logs_cannot_be_updated_or_deleted_via_api(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;
        $log = AdminLog::factory()->create();

        // Tentative de PUT/PATCH/DELETE
        $patchRes = $this->withToken($token)->patchJson("/api/admin/logs/{$log->id}", ['action' => 'fake']);
        $deleteRes = $this->withToken($token)->deleteJson("/api/admin/logs/{$log->id}");

        $patchRes->assertStatus(405);
        $deleteRes->assertStatus(405);
    }

    /**
     * Test de l'exclusion des champs sensibles (ex: password) dans les valeurs loguées.
     */
    public function test_sensitive_fields_are_automatically_sanitized(): void
    {
        $service = app(AdminLogService::class);

        $input = [
            'name' => 'Admin User',
            'email' => 'admin@hafrose.com',
            'password' => 'SecretPassword123!',
            'password_confirmation' => 'SecretPassword123!',
            'token' => 'bearer-secret-token',
        ];

        $sanitized = $service->sanitize($input);

        $this->assertArrayHasKey('name', $sanitized);
        $this->assertArrayHasKey('email', $sanitized);
        $this->assertArrayNotHasKey('password', $sanitized);
        $this->assertArrayNotHasKey('password_confirmation', $sanitized);
        $this->assertArrayNotHasKey('token', $sanitized);
    }
}
