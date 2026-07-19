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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // Utilisateur concerné (nullable pour actions publiques/visiteurs ou suppression)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Type d'événement (auth.login, order.created, etc.)
            $table->string('event_type', 50);

            // Catégorie d'événement (auth, order, wishlist, contact, review)
            $table->string('category', 50);

            // Ressource associée (ex: orders, reviews, products)
            $table->string('resource', 100)->nullable();

            // Identifiant de la ressource concernée (nullable)
            $table->unsignedBigInteger('resource_id')->nullable();

            // Adresse IP de la requête
            $table->string('ip_address', 45)->nullable();

            // User-Agent du client
            $table->text('user_agent')->nullable();

            // Métadonnées complémentaires
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Index pour optimiser les performances des requêtes de filtrage/recherche
            $table->index('user_id');
            $table->index('event_type');
            $table->index('category');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
