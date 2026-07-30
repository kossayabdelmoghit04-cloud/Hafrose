<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->default('Adresse');           // Ex: Domicile, Bureau
            $table->string('name');                                // Nom complet du destinataire
            $table->string('address');                             // Rue + numéro
            $table->string('city');
            $table->string('postal_code', 20);
            $table->string('country')->default('France');
            $table->string('phone', 30)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            // Index pour accélération des requêtes par utilisateur
            $table->index(['user_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
