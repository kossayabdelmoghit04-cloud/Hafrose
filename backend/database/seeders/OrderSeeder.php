<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        if ($products->isEmpty()) {
            return;
        }

        // Créer 10 commandes réalistes
        Order::factory()
            ->count(10)
            ->create()
            ->each(function (Order $order) use ($products) {
                // Pour chaque commande, générer entre 1 et 3 articles différents
                $itemCount = rand(1, 3);
                $selectedProducts = $products->random($itemCount);

                foreach ($selectedProducts as $product) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => rand(1, 2),
                        'unit_price' => $product->price,
                        'subtotal' => 0.00, // Mis à jour par l'événement "saving" du modèle OrderItem
                    ]);
                }
            });
    }
}
