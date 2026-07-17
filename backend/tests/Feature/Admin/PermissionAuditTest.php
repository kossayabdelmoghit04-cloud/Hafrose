<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Suite d'audit de permissions — Phase 4.2 HAFROSE
 *
 * Chaque endpoint d'administration est testé dans trois scénarios :
 *  1. Administrateur authentifié          → réponse légitime (200/201/etc.)
 *  2. Utilisateur authentifié non-admin   → 403 Forbidden
 *  3. Visiteur non authentifié            → 401 Unauthenticated
 *
 * Ces tests garantissent qu'aucune route admin n'est accessible sans le rôle adéquat.
 */
class PermissionAuditTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /** Crée un administrateur et retourne son token Sanctum. */
    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    /** Crée un client (utilisateur ordinaire) et retourne son token Sanctum. */
    private function customerToken(): string
    {
        $user = User::factory()->create(['role' => 'customer']);
        return $user->createToken('user-token')->plainTextToken;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Dashboard
    // ──────────────────────────────────────────────────────────────────────────

    public function test_dashboard_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/dashboard');
        $response->assertOk();
    }

    public function test_dashboard_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/dashboard');
        $response->assertForbidden();
    }

    public function test_dashboard_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Catégories CRUD
    // ──────────────────────────────────────────────────────────────────────────

    public function test_categories_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/categories');
        $response->assertOk();
    }

    public function test_categories_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/categories');
        $response->assertForbidden();
    }

    public function test_categories_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/categories');
        $response->assertUnauthorized();
    }

    public function test_category_store_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->postJson('/api/admin/categories', [
            'name' => 'Nouvelle catégorie',
            'slug' => 'nouvelle-categorie',
        ]);
        $response->assertForbidden();
    }

    public function test_category_store_unauthorized_for_guest(): void
    {
        $response = $this->postJson('/api/admin/categories', [
            'name' => 'Nouvelle catégorie',
            'slug' => 'nouvelle-categorie',
        ]);
        $response->assertUnauthorized();
    }

    public function test_category_update_forbidden_for_customer(): void
    {
        $category = Category::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->postJson("/api/admin/categories/{$category->id}", ['name' => 'Modifié']);
        $response->assertForbidden();
    }

    public function test_category_update_unauthorized_for_guest(): void
    {
        $category = Category::factory()->create();
        $response = $this->postJson("/api/admin/categories/{$category->id}", ['name' => 'Modifié']);
        $response->assertUnauthorized();
    }

    public function test_category_destroy_forbidden_for_customer(): void
    {
        $category = Category::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->deleteJson("/api/admin/categories/{$category->id}");
        $response->assertForbidden();
    }

    public function test_category_destroy_unauthorized_for_guest(): void
    {
        $category = Category::factory()->create();
        $response = $this->deleteJson("/api/admin/categories/{$category->id}");
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Produits CRUD
    // ──────────────────────────────────────────────────────────────────────────

    public function test_products_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/products');
        $response->assertOk();
    }

    public function test_products_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/products');
        $response->assertForbidden();
    }

    public function test_products_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/products');
        $response->assertUnauthorized();
    }

    public function test_product_store_forbidden_for_customer(): void
    {
        $category = Category::factory()->create();
        $response = $this->withToken($this->customerToken())->postJson('/api/admin/products', [
            'name'        => 'Produit Test',
            'slug'        => 'produit-test',
            'price'       => 99.99,
            'stock'       => 10,
            'category_id' => $category->id,
            'description' => 'Description.',
        ]);
        $response->assertForbidden();
    }

    public function test_product_store_unauthorized_for_guest(): void
    {
        $response = $this->postJson('/api/admin/products', []);
        $response->assertUnauthorized();
    }

    public function test_product_update_forbidden_for_customer(): void
    {
        $product = Product::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->postJson("/api/admin/products/{$product->id}", ['price' => 50]);
        $response->assertForbidden();
    }

    public function test_product_update_unauthorized_for_guest(): void
    {
        $product = Product::factory()->create();
        $response = $this->postJson("/api/admin/products/{$product->id}", ['price' => 50]);
        $response->assertUnauthorized();
    }

    public function test_product_destroy_forbidden_for_customer(): void
    {
        Storage::fake('public');
        $product = Product::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->deleteJson("/api/admin/products/{$product->id}");
        $response->assertForbidden();
    }

    public function test_product_destroy_unauthorized_for_guest(): void
    {
        $product = Product::factory()->create();
        $response = $this->deleteJson("/api/admin/products/{$product->id}");
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Commandes
    // ──────────────────────────────────────────────────────────────────────────

    public function test_orders_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/orders');
        $response->assertOk();
    }

    public function test_orders_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/orders');
        $response->assertForbidden();
    }

    public function test_orders_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/orders');
        $response->assertUnauthorized();
    }

    public function test_order_show_forbidden_for_customer(): void
    {
        $order = Order::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->getJson("/api/admin/orders/{$order->id}");
        $response->assertForbidden();
    }

    public function test_order_show_unauthorized_for_guest(): void
    {
        $order = Order::factory()->create();
        $response = $this->getJson("/api/admin/orders/{$order->id}");
        $response->assertUnauthorized();
    }

    public function test_order_update_status_forbidden_for_customer(): void
    {
        $order = Order::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed']);
        $response->assertForbidden();
    }

    public function test_order_update_status_unauthorized_for_guest(): void
    {
        $order = Order::factory()->create();
        $response = $this->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed']);
        $response->assertUnauthorized();
    }

    public function test_order_pdf_forbidden_for_customer(): void
    {
        $order = Order::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->getJson("/api/admin/orders/{$order->id}/pdf");
        $response->assertForbidden();
    }

    public function test_order_pdf_unauthorized_for_guest(): void
    {
        $order = Order::factory()->create();
        $response = $this->getJson("/api/admin/orders/{$order->id}/pdf");
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Avis
    // ──────────────────────────────────────────────────────────────────────────

    public function test_reviews_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/reviews');
        $response->assertOk();
    }

    public function test_reviews_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/reviews');
        $response->assertForbidden();
    }

    public function test_reviews_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/reviews');
        $response->assertUnauthorized();
    }

    public function test_review_approve_forbidden_for_customer(): void
    {
        $review = Review::factory()->create(['is_approved' => false]);
        $response = $this->withToken($this->customerToken())
            ->patchJson("/api/admin/reviews/{$review->id}/approve");
        $response->assertForbidden();
    }

    public function test_review_approve_unauthorized_for_guest(): void
    {
        $review = Review::factory()->create();
        $response = $this->patchJson("/api/admin/reviews/{$review->id}/approve");
        $response->assertUnauthorized();
    }

    public function test_review_reject_forbidden_for_customer(): void
    {
        $review = Review::factory()->create(['is_approved' => true]);
        $response = $this->withToken($this->customerToken())
            ->patchJson("/api/admin/reviews/{$review->id}/reject");
        $response->assertForbidden();
    }

    public function test_review_reject_unauthorized_for_guest(): void
    {
        $review = Review::factory()->create();
        $response = $this->patchJson("/api/admin/reviews/{$review->id}/reject");
        $response->assertUnauthorized();
    }

    public function test_review_destroy_forbidden_for_customer(): void
    {
        $review = Review::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->deleteJson("/api/admin/reviews/{$review->id}");
        $response->assertForbidden();
    }

    public function test_review_destroy_unauthorized_for_guest(): void
    {
        $review = Review::factory()->create();
        $response = $this->deleteJson("/api/admin/reviews/{$review->id}");
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6. Contacts (Messages)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_contacts_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/contacts');
        $response->assertOk();
    }

    public function test_contacts_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/contacts');
        $response->assertForbidden();
    }

    public function test_contacts_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/contacts');
        $response->assertUnauthorized();
    }

    public function test_contact_mark_as_read_forbidden_for_customer(): void
    {
        $contact = Contact::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->patchJson("/api/admin/contacts/{$contact->id}/read");
        $response->assertForbidden();
    }

    public function test_contact_mark_as_read_unauthorized_for_guest(): void
    {
        $contact = Contact::factory()->create();
        $response = $this->patchJson("/api/admin/contacts/{$contact->id}/read");
        $response->assertUnauthorized();
    }

    public function test_contact_destroy_forbidden_for_customer(): void
    {
        $contact = Contact::factory()->create();
        $response = $this->withToken($this->customerToken())
            ->deleteJson("/api/admin/contacts/{$contact->id}");
        $response->assertForbidden();
    }

    public function test_contact_destroy_unauthorized_for_guest(): void
    {
        $contact = Contact::factory()->create();
        $response = $this->deleteJson("/api/admin/contacts/{$contact->id}");
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 7. Paramètres
    // ──────────────────────────────────────────────────────────────────────────

    public function test_settings_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/settings');
        $response->assertOk();
    }

    public function test_settings_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/settings');
        $response->assertForbidden();
    }

    public function test_settings_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/settings');
        $response->assertUnauthorized();
    }

    public function test_settings_update_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())
            ->postJson('/api/admin/settings', ['settings' => []]);
        $response->assertForbidden();
    }

    public function test_settings_update_unauthorized_for_guest(): void
    {
        $response = $this->postJson('/api/admin/settings', ['settings' => []]);
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 8. Médiathèque
    // ──────────────────────────────────────────────────────────────────────────

    public function test_media_index_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/media');
        $response->assertOk();
    }

    public function test_media_index_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/media');
        $response->assertForbidden();
    }

    public function test_media_index_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/media');
        $response->assertUnauthorized();
    }

    public function test_media_store_forbidden_for_customer(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('test.jpg', 100, 'image/jpeg');
        $response = $this->withToken($this->customerToken())
            ->post('/api/admin/media', ['file' => $file], ['Accept' => 'application/json']);
        $response->assertForbidden();
    }

    public function test_media_store_unauthorized_for_guest(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('test.jpg', 100, 'image/jpeg');
        $response = $this->post('/api/admin/media', ['file' => $file], ['Accept' => 'application/json']);
        $response->assertUnauthorized();
    }

    public function test_media_destroy_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->deleteJson('/api/admin/media/9999');
        $response->assertForbidden();
    }

    public function test_media_destroy_unauthorized_for_guest(): void
    {
        $response = $this->deleteJson('/api/admin/media/9999');
        $response->assertUnauthorized();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 9. Profil Admin (me / logout)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_me_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->getJson('/api/admin/me');
        $response->assertOk();
    }

    public function test_me_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->getJson('/api/admin/me');
        $response->assertForbidden();
    }

    public function test_me_unauthorized_for_guest(): void
    {
        $response = $this->getJson('/api/admin/me');
        $response->assertUnauthorized();
    }

    public function test_logout_accessible_by_admin(): void
    {
        $response = $this->withToken($this->adminToken())->postJson('/api/admin/logout');
        $response->assertOk();
    }

    public function test_logout_forbidden_for_customer(): void
    {
        $response = $this->withToken($this->customerToken())->postJson('/api/admin/logout');
        $response->assertForbidden();
    }

    public function test_logout_unauthorized_for_guest(): void
    {
        $response = $this->postJson('/api/admin/logout');
        $response->assertUnauthorized();
    }
}
