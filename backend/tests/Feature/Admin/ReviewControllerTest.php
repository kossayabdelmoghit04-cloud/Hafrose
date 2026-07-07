<?php

namespace Tests\Feature\Admin;

use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function test_can_list_all_reviews(): void
    {
        $token = $this->adminToken();
        Review::factory()->count(4)->create(['is_approved' => false]);

        $response = $this->withToken($token)->getJson('/api/admin/reviews');

        $response->assertOk()
                 ->assertJsonStructure(['data' => [['id', 'customer_name', 'rating', 'is_approved']]]);
    }

    // ─── Approve ──────────────────────────────────────────────────────────────

    public function test_can_approve_review(): void
    {
        $token  = $this->adminToken();
        $review = Review::factory()->create(['is_approved' => false]);

        $response = $this->withToken($token)->patchJson("/api/admin/reviews/{$review->id}/approve");

        $response->assertOk()
                 ->assertJsonFragment(['is_approved' => true]);

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'is_approved' => true]);
    }

    // ─── Reject ───────────────────────────────────────────────────────────────

    public function test_can_reject_review(): void
    {
        $token  = $this->adminToken();
        $review = Review::factory()->create(['is_approved' => true]);

        $response = $this->withToken($token)->patchJson("/api/admin/reviews/{$review->id}/reject");

        $response->assertOk()
                 ->assertJsonFragment(['is_approved' => false]);

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'is_approved' => false]);
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function test_can_delete_review(): void
    {
        $token  = $this->adminToken();
        $review = Review::factory()->create();

        $response = $this->withToken($token)->deleteJson("/api/admin/reviews/{$review->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_delete_nonexistent_review_returns_404(): void
    {
        $token = $this->adminToken();

        $this->withToken($token)->deleteJson('/api/admin/reviews/99999')->assertNotFound();
    }

    public function test_reviews_require_authentication(): void
    {
        $this->getJson('/api/admin/reviews')->assertUnauthorized();
    }
}
