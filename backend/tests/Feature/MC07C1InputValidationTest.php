<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MC07C1InputValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_autocomplete_rejects_array_and_documents_empty_query(): void
    {
        $this->getJson('/api/products/autocomplete?q[]=x')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('q');

        $this->getJson('/api/products/autocomplete')->assertOk()->assertJsonPath('data', []);

        Product::factory()->create(['name' => 'Robe Validation']);
        $this->getJson('/api/products/autocomplete?q=Robe')->assertOk();
    }

    public function test_gift_card_rejects_array_empty_and_malformed_code(): void
    {
        $this->getJson('/api/gift-cards/check?code[]=x')->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->getJson('/api/gift-cards/check')->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->getJson('/api/gift-cards/check?code=bad%20code')->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->getJson('/api/gift-cards/check?code=HAFROSE-VALID')->assertNotFound();
    }
}
