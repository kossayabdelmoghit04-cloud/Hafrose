<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Review;
use App\Models\Contact;
use App\Models\ActivityLog;
use App\Models\WishlistItem;
use App\Services\ActivityLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email'    => 'admin@hafrose.com',
            'password' => bcrypt('Admin@Hafrose2024!'),
            'role'     => User::ROLE_ADMIN,
        ]);
    }

    private function createCustomer(): User
    {
        return User::factory()->create([
            'role' => 'customer',
        ]);
    }

    // ─── Tests d'authentification ──────────────────────────────────────────────

    public function test_login_and_logout_generate_activity_logs(): void
    {
        $admin = $this->createAdmin();

        // 1. Test Login
        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'Admin@Hafrose2024!',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_USER_LOGIN,
            'category'   => ActivityLog::CATEGORY_AUTH,
            'resource'   => 'users',
            'resource_id'=> $admin->id,
        ]);

        $token = $response->json('data.token');

        // 2. Test Logout
        $logoutResponse = $this->withToken($token)->postJson('/api/admin/logout');
        $logoutResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_USER_LOGOUT,
            'category'   => ActivityLog::CATEGORY_AUTH,
            'resource'   => 'users',
            'resource_id'=> $admin->id,
        ]);
    }

    public function test_failed_login_does_not_generate_activity_logs(): void
    {
        $this->createAdmin();

        $response = $this->postJson('/api/admin/login', [
            'email'    => 'admin@hafrose.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();

        $this->assertDatabaseMissing('activity_logs', [
            'event_type' => ActivityLog::EVENT_USER_LOGIN,
        ]);
    }

    // ─── Tests Commandes ────────────────────────────────────────────────────────

    public function test_creating_order_generates_activity_log(): void
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 50.00]);

        $response = $this->postJson('/api/orders', [
            'customer' => 'John Doe',
            'phone'    => '0606060606',
            'address'  => '123 Rue de Hafrose',
            'city'     => 'Paris',
            'items'    => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                ]
            ]
        ]);

        $response->assertCreated();
        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('activity_logs', [
            'event_type' => ActivityLog::EVENT_ORDER_CREATED,
            'category'   => ActivityLog::CATEGORY_ORDER,
            'resource'   => 'orders',
            'resource_id'=> $orderId,
        ]);

        // Vérifier les métadonnées
        $log = ActivityLog::where('event_type', ActivityLog::EVENT_ORDER_CREATED)->first();
        $this->assertEquals('John Doe', $log->metadata['customer']);
        $this->assertEquals(100.00, $log->metadata['total_price']);
        $this->assertEquals('Paris', $log->metadata['city']);
    }

    public function test_failed_order_due_to_stock_does_not_log_activity(): void
    {
        $product = Product::factory()->create(['stock' => 1, 'price' => 50.00]);

        $response = $this->postJson('/api/orders', [
            'customer' => 'John Doe',
            'phone'    => '0606060606',
            'address'  => '123 Rue de Hafrose',
            'city'     => 'Paris',
            'items'    => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 5, // Demande plus que le stock
                ]
            ]
        ]);

        $response->assertStatus(409); // Conflict

        $this->assertDatabaseMissing('activity_logs', [
            'event_type' => ActivityLog::EVENT_ORDER_CREATED,
        ]);
    }

    public function test_updating_order_status_generates_activity_log(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $order = Order::create([
            'customer_name' => 'John Doe',
            'phone'         => '0606060606',
            'address'       => '123 Rue de Hafrose',
            'city'          => 'Paris',
            'total_price'   => 150.00,
            'status'        => Order::STATUS_PENDING,
        ]);

        $response = $this->withToken($token)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => Order::STATUS_CONFIRMED,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_ORDER_STATUS_CHANGED,
            'category'   => ActivityLog::CATEGORY_ORDER,
            'resource'   => 'orders',
            'resource_id'=> $order->id,
        ]);

        $log = ActivityLog::where('event_type', ActivityLog::EVENT_ORDER_STATUS_CHANGED)->first();
        $this->assertEquals(Order::STATUS_PENDING, $log->metadata['old_status']);
        $this->assertEquals(Order::STATUS_CONFIRMED, $log->metadata['new_status']);
    }

    // ─── Tests Wishlist (Favoris) ──────────────────────────────────────────────

    public function test_wishlist_operations_generate_activity_logs(): void
    {
        $customer = $this->createCustomer();
        $token = $customer->createToken('user-token')->plainTextToken;
        $product = Product::factory()->create();

        // 1. Ajouter aux favoris
        $response = $this->withToken($token)->postJson('/api/wishlist', [
            'product_id' => $product->id,
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $customer->id,
            'event_type' => ActivityLog::EVENT_WISHLIST_ADDED,
            'category'   => ActivityLog::CATEGORY_WISHLIST,
            'resource'   => 'products',
            'resource_id'=> $product->id,
        ]);

        // 2. Retirer des favoris
        $deleteResponse = $this->withToken($token)->deleteJson("/api/wishlist/{$product->id}");
        $deleteResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $customer->id,
            'event_type' => ActivityLog::EVENT_WISHLIST_REMOVED,
            'category'   => ActivityLog::CATEGORY_WISHLIST,
            'resource'   => 'products',
            'resource_id'=> $product->id,
        ]);
    }

    // ─── Tests Contact ──────────────────────────────────────────────────────────

    public function test_contact_operations_generate_activity_logs(): void
    {
        // 1. Envoi formulaire
        $response = $this->postJson('/api/contact', [
            'name'    => 'Visitor One',
            'email'   => 'visitor@example.com',
            'phone'   => '0102030405',
            'subject' => 'Question about shipping',
            'message' => 'Hello, do you ship to Belgium?',
        ]);

        $response->assertCreated();
        $contactId = $response->json('data.id');

        $this->assertDatabaseHas('activity_logs', [
            'event_type' => ActivityLog::EVENT_CONTACT_SENT,
            'category'   => ActivityLog::CATEGORY_CONTACT,
            'resource'   => 'contacts',
            'resource_id'=> $contactId,
        ]);

        // 2. Marquer comme lu (Admin)
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $readResponse = $this->withToken($token)->patchJson("/api/admin/contacts/{$contactId}/read");
        $readResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_CONTACT_MARKED_READ,
            'category'   => ActivityLog::CATEGORY_CONTACT,
            'resource'   => 'contacts',
            'resource_id'=> $contactId,
        ]);

        // 3. Supprimer le contact (Admin)
        $deleteResponse = $this->withToken($token)->deleteJson("/api/admin/contacts/{$contactId}");
        $deleteResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_CONTACT_DELETED,
            'category'   => ActivityLog::CATEGORY_CONTACT,
            'resource'   => 'contacts',
            'resource_id'=> $contactId,
        ]);
    }

    // ─── Tests Avis (Reviews) ───────────────────────────────────────────────────

    public function test_review_operations_generate_activity_logs(): void
    {
        $product = Product::factory()->create();

        // 1. Dépôt avis
        $response = $this->postJson('/api/reviews', [
            'product_id'    => $product->id,
            'customer_name' => 'Reviewer One',
            'rating'        => 5,
            'comment'       => 'Great product!',
        ]);

        $response->assertCreated();
        $reviewId = $response->json('data.id');

        $this->assertDatabaseHas('activity_logs', [
            'event_type' => ActivityLog::EVENT_REVIEW_SUBMITTED,
            'category'   => ActivityLog::CATEGORY_REVIEW,
            'resource'   => 'reviews',
            'resource_id'=> $reviewId,
        ]);

        // 2. Approbation avis (Admin)
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $approveResponse = $this->withToken($token)->patchJson("/api/admin/reviews/{$reviewId}/approve");
        $approveResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_REVIEW_APPROVED,
            'category'   => ActivityLog::CATEGORY_REVIEW,
            'resource'   => 'reviews',
            'resource_id'=> $reviewId,
        ]);

        // 3. Rejet avis (Admin)
        $rejectResponse = $this->withToken($token)->patchJson("/api/admin/reviews/{$reviewId}/reject");
        $rejectResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_REVIEW_REJECTED,
            'category'   => ActivityLog::CATEGORY_REVIEW,
            'resource'   => 'reviews',
            'resource_id'=> $reviewId,
        ]);

        // 4. Suppression avis (Admin)
        $deleteResponse = $this->withToken($token)->deleteJson("/api/admin/reviews/{$reviewId}");
        $deleteResponse->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'user_id'    => $admin->id,
            'event_type' => ActivityLog::EVENT_REVIEW_DELETED,
            'category'   => ActivityLog::CATEGORY_REVIEW,
            'resource'   => 'reviews',
            'resource_id'=> $reviewId,
        ]);
    }

    // ─── Sécurité Exception ────────────────────────────────────────────────────

    public function test_logging_failure_does_not_interrupt_business_flow(): void
    {
        // On va forcer l'échec de la journalisation en passant un type d'événement qui dépasse la taille en base
        // ou en provoquant une exception dans le service.
        // Ici, nous testons directement la méthode du service avec des données causant une erreur PDO (ex: event_type trop long > 50 chars).
        $service = app(ActivityLogService::class);

        // Cette ligne générerait une exception SQL si non capturée (event_type de 100 caractères alors que la colonne est limitée à 50)
        $veryLongEventType = str_repeat('a', 100);

        // On vérifie que la méthode ne lève pas d'exception
        $service->log(
            eventType:  $veryLongEventType,
            category:   ActivityLog::CATEGORY_AUTH
        );

        $this->assertTrue(true); // Si on arrive ici sans plantage, c'est bon !
    }
}
