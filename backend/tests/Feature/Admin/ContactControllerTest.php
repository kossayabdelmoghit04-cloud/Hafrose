<?php

namespace Tests\Feature\Admin;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        return $admin->createToken('admin-token')->plainTextToken;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function test_can_list_contact_messages(): void
    {
        $token = $this->adminToken();
        Contact::factory()->count(3)->create();

        $response = $this->withToken($token)->getJson('/api/admin/contacts');

        $response->assertOk()
                 ->assertJsonStructure(['data' => [['id', 'name', 'email', 'subject', 'is_read']]]);
    }

    public function test_contacts_can_be_filtered_by_is_read(): void
    {
        $token = $this->adminToken();
        Contact::factory()->count(2)->create(['is_read' => false]);
        Contact::factory()->count(3)->create(['is_read' => true]);

        $response = $this->withToken($token)->getJson('/api/admin/contacts?is_read=0');

        $response->assertOk();
        $contacts = $response->json('data');
        foreach ($contacts as $contact) {
            $this->assertFalse($contact['is_read']);
        }
    }

    // ─── Mark as Read ─────────────────────────────────────────────────────────

    public function test_can_mark_contact_as_read(): void
    {
        $token   = $this->adminToken();
        $contact = Contact::factory()->create(['is_read' => false]);

        $response = $this->withToken($token)->patchJson("/api/admin/contacts/{$contact->id}/read");

        $response->assertOk()
                 ->assertJsonPath('data.is_read', true);

        $this->assertDatabaseHas('contacts', ['id' => $contact->id, 'is_read' => true]);
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function test_can_delete_contact_message(): void
    {
        $token   = $this->adminToken();
        $contact = Contact::factory()->create();

        $response = $this->withToken($token)->deleteJson("/api/admin/contacts/{$contact->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }

    public function test_delete_nonexistent_contact_returns_404(): void
    {
        $token = $this->adminToken();

        $this->withToken($token)->deleteJson('/api/admin/contacts/99999')->assertNotFound();
    }

    public function test_contacts_require_authentication(): void
    {
        $this->getJson('/api/admin/contacts')->assertUnauthorized();
    }
}
