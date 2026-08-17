<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminExportTest extends TestCase
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
     * Test unauthenticated access is rejected for CSV exports.
     */
    public function test_unauthenticated_user_cannot_export_csv(): void
    {
        $response = $this->getJson('/api/admin/export/products/csv');
        $response->assertUnauthorized();
    }

    /**
     * Test non-admin user access is forbidden for CSV exports.
     */
    public function test_non_admin_cannot_export_csv(): void
    {
        $customer = $this->createCustomer();
        $token = $customer->createToken('token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/export/products/csv');
        $response->assertForbidden();
    }

    /**
     * Test Admin CSV Export for Products.
     */
    public function test_admin_can_export_products_csv(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $category = Category::factory()->create(['name' => 'Montres']);
        Product::factory()->create([
            'name' => 'Chrono Luxe',
            'category_id' => $category->id,
            'price' => 1290.00,
        ]);

        $response = $this->withToken($token)->get('/api/admin/export/products/csv');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Chrono Luxe', $response->streamedContent());
        $this->assertStringContainsString('Montres', $response->streamedContent());
    }

    /**
     * Test Admin CSV Export for Categories.
     */
    public function test_admin_can_export_categories_csv(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        Category::factory()->create(['name' => 'Bijoux Elegance']);

        $response = $this->withToken($token)->get('/api/admin/export/categories/csv');

        $response->assertOk();
        $this->assertStringContainsString('Bijoux Elegance', $response->streamedContent());
    }

    /**
     * Test Admin CSV Export for Orders.
     */
    public function test_admin_can_export_orders_csv(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        Order::factory()->create(['customer_name' => 'Jean Dupont', 'city' => 'Paris']);

        $response = $this->withToken($token)->get('/api/admin/export/orders/csv');

        $response->assertOk();
        $this->assertStringContainsString('Jean Dupont', $response->streamedContent());
        $this->assertStringContainsString('Paris', $response->streamedContent());
    }

    /**
     * Test Admin CSV Export for Reviews.
     */
    public function test_admin_can_export_reviews_csv(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $product = Product::factory()->create();
        Review::factory()->create(['product_id' => $product->id, 'customer_name' => 'Claire', 'comment' => 'Superbe produit']);

        $response = $this->withToken($token)->get('/api/admin/export/reviews/csv');

        $response->assertOk();
        $this->assertStringContainsString('Claire', $response->streamedContent());
        $this->assertStringContainsString('Superbe produit', $response->streamedContent());
    }

    /**
     * Test Admin CSV Export for Contacts.
     */
    public function test_admin_can_export_contacts_csv(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        Contact::factory()->create(['name' => 'Alice', 'subject' => 'Question Stock']);

        $response = $this->withToken($token)->get('/api/admin/export/contacts/csv');

        $response->assertOk();
        $this->assertStringContainsString('Alice', $response->streamedContent());
        $this->assertStringContainsString('Question Stock', $response->streamedContent());
    }

    /**
     * Test Admin CSV Export for Users.
     */
    public function test_admin_can_export_users_csv(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withToken($token)->get('/api/admin/export/users/csv');

        $response->assertOk();
        $this->assertStringContainsString($admin->email, $response->streamedContent());
    }

    /**
     * Test Admin Excel Export for Products download.
     */
    public function test_admin_can_export_products_excel(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        Product::factory()->create(['name' => 'Excel Product']);

        $response = $this->withToken($token)->get('/api/admin/export/products/excel');

        $response->assertOk();
        $response->assertHeader('content-disposition');
    }

    /**
     * Test CSV Export filters (search & category).
     */
    public function test_csv_export_respects_filters(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('admin-token')->plainTextToken;

        Product::factory()->create(['name' => 'Alpha Watch']);
        Product::factory()->create(['name' => 'Beta Bracelet']);

        $response = $this->withToken($token)->get('/api/admin/export/products/csv?search=Alpha');

        $response->assertOk();
        $this->assertStringContainsString('Alpha Watch', $response->streamedContent());
        $this->assertStringNotContainsString('Beta Bracelet', $response->streamedContent());
    }
}
