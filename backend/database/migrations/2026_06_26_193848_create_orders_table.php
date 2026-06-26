<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('phone', 50);
            $table->text('address');
            $table->string('city', 100);
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->enum('status', ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'])
                  ->default('En attente')
                  ->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
