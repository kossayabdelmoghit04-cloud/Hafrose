<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $order = Order::inRandomOrder()->first() ?? Order::factory()->create();
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        
        return [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $this->faker->numberBetween(1, 3), // Les produits de luxe s'achètent rarement en masse
            'unit_price' => $product->price,
            'subtotal' => 0.00, // Calculé automatiquement à la sauvegarde par l'événement Eloquent
        ];
    }
}
