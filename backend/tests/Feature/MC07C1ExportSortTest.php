<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1ExportSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_accepts_whitelisted_sort_and_rejects_arbitrary_column(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        Product::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->get('/api/admin/export/products/csv?sort_by=price&sort_order=asc')
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/export/products/csv?sort_by=password')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('sort_by');
    }
}
