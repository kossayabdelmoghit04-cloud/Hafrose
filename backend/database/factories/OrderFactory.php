<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $villesMonacoLuxe = ['Paris', 'Lyon', 'Monaco', 'Nice', 'Cannes', 'Genève', 'Bruxelles', 'Bordeaux', 'Deauville', 'Saint-Tropez'];
        
        return [
            'customer_name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->randomElement($villesMonacoLuxe),
            'total_price' => 0.00, // Mis à jour automatiquement par le boot de OrderItem
            'status' => $this->faker->randomElement([
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_SHIPPED,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED
            ]),
        ];
    }

    /**
     * Commande en attente (Status Pending)
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_PENDING,
        ]);
    }

    /**
     * Commande livrée (Status Delivered)
     */
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_DELIVERED,
        ]);
    }
}
