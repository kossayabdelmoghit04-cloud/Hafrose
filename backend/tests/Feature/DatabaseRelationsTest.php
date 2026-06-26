<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Gallery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseRelationsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Teste la relation Category et Product (One-To-Many)
     */
    public function test_category_has_many_products_relation(): void
    {
        $category = Category::factory()->create([
            'name' => 'Sacs',
            'slug' => 'sacs'
        ]);

        $product1 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Sac Cabas',
            'slug' => 'sac-cabas',
            'price' => 1200.00
        ]);

        $product2 = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Sac Pochette',
            'slug' => 'sac-pochette',
            'price' => 500.00
        ]);

        $this->assertCount(2, $category->products);
        $this->assertEquals($category->id, $product1->category->id);
        $this->assertEquals('Sacs', $product1->category->name);
    }

    /**
     * Teste la relation Product et Gallery (One-To-Many)
     */
    public function test_product_has_many_galleries_relation(): void
    {
        $product = Product::factory()->create();

        $gallery1 = Gallery::factory()->create([
            'product_id' => $product->id,
            'image' => 'img1.jpg'
        ]);

        $gallery2 = Gallery::factory()->create([
            'product_id' => $product->id,
            'image' => 'img2.jpg'
        ]);

        $this->assertCount(2, $product->galleries);
        $this->assertEquals($product->id, $gallery1->product->id);
    }

    /**
     * Teste la relation Product et Review (One-To-Many)
     */
    public function test_product_has_many_reviews_relation(): void
    {
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'Parfait',
            'is_approved' => true
        ]);

        $this->assertCount(1, $product->reviews);
        $this->assertEquals($product->id, $review->product->id);
        $this->assertTrue($review->is_approved);
    }

    /**
     * Teste la relation Order et OrderItem, et le calcul automatique du total de la commande
     */
    public function test_order_and_order_items_relation_with_automatic_calculations(): void
    {
        // 1. Créer une commande
        $order = Order::factory()->create([
            'total_price' => 0.00
        ]);

        $product1 = Product::factory()->create(['price' => 100.00]);
        $product2 = Product::factory()->create(['price' => 250.00]);

        // 2. Ajouter un OrderItem (quantité 2, prix unitaire 100.00)
        $item1 = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'unit_price' => 100.00,
            'subtotal' => 0.00 // Sera calculé par l'événement "saving"
        ]);

        // Vérification du sous-total de la ligne
        $this->assertEquals(200.00, $item1->subtotal);

        // Vérification du total de la commande mis à jour automatiquement
        $order->refresh();
        $this->assertEquals(200.00, $order->total_price);

        // 3. Ajouter un second OrderItem (quantité 1, prix unitaire 250.00)
        $item2 = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'unit_price' => 250.00,
            'subtotal' => 0.00
        ]);

        // Vérification du sous-total
        $this->assertEquals(250.00, $item2->subtotal);

        // Vérification du total global de la commande
        $order->refresh();
        $this->assertEquals(450.00, $order->total_price);

        // 4. Supprimer un OrderItem et vérifier que la commande recalcule son total
        $item1->delete();
        $order->refresh();
        $this->assertEquals(250.00, $order->total_price);
    }

    /**
     * Teste la règle ON DELETE SET NULL sur le produit commandé
     */
    public function test_product_deletion_sets_null_in_order_items_preserving_history(): void
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 500.00]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 0.00
        ]);

        $this->assertEquals($product->id, $item->product_id);

        // Supprimer le produit
        $product->delete();

        // Recharger l'article depuis la base de données
        $item->refresh();

        // Le product_id doit être mis à NULL
        $this->assertNull($item->product_id);

        // Les informations financières doivent être préservées
        $this->assertEquals(500.00, $item->unit_price);
        $this->assertEquals(500.00, $item->subtotal);
    }

    /**
     * Teste l'insertion d'un message de contact
     */
    public function test_contact_message_creation(): void
    {
        $contact = Contact::create([
            'name' => 'Jean Dupont',
            'email' => 'jean.dupont@example.com',
            'phone' => '+33 6 12 34 56 78',
            'subject' => 'Question produit',
            'message' => 'Bonjour, j\'aimerais en savoir plus...'
        ]);

        $this->assertNotNull($contact->created_at);
        $this->assertEquals('Jean Dupont', $contact->name);
    }

    /**
     * Teste la création de l'administrateur avec le rôle et Spatie Permission
     */
    public function test_admin_creation_and_spatie_role(): void
    {
        // Exécuter le seeder des rôles
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin.test@hafrose.com',
            'password' => bcrypt('password'),
            'role' => User::ROLE_ADMIN
        ]);

        $admin->assignRole('admin');

        $this->assertEquals(User::ROLE_ADMIN, $admin->role);
        $this->assertTrue($admin->hasRole('admin'));
        $this->assertTrue($admin->hasPermissionTo('manage dashboard'));
    }
}
