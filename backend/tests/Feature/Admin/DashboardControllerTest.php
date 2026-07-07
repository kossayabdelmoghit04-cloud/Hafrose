<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\Contact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    public function test_dashboard_returns_all_metrics(): void
    {
        $token = $this->adminToken();

        $response = $this->withToken($token)->getJson('/api/admin/dashboard');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => [
                         'metrics' => [
                             'products_count',
                             'categories_count',
                             'orders_count',
                             'pending_orders',
                             'revenue',
                             'pending_reviews',
                             'unread_contacts',
                         ],
                         'sales_chart',
                         'popular_products',
                         'latest_orders',
                         'latest_messages',
                     ],
                 ]);
    }

    public function test_dashboard_metrics_reflect_real_data(): void
    {
        $token = $this->adminToken();

        Category::factory()->count(3)->create();
        Product::factory()->count(5)->create();
        Review::factory()->count(2)->create(['is_approved' => false]);
        Contact::factory()->count(4)->create(['is_read' => false]);

        $response = $this->withToken($token)->getJson('/api/admin/dashboard');

        $response->assertOk();
        $data = $response->json('data.metrics');

        $this->assertEquals(3, $data['categories_count']);
        $this->assertEquals(5, $data['products_count']);
        $this->assertEquals(2, $data['pending_reviews']);
        $this->assertEquals(4, $data['unread_contacts']);
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }
}
