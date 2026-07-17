<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Créer la table des logs d'administration.
     */
    public function up(): void
    {
        Schema::create('admin_logs', function (Blueprint $table) {
            $table->id();

            // Administrateur ayant effectué l'action (nullable pour logs système)
            $table->foreignId('admin_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Type d'action réalisée (login, logout, create, update, delete…)
            $table->string('action', 50);

            // Ressource concernée (product, category, order…)
            $table->string('resource', 100);

            // Identifiant de la ressource concernée (nullable pour actions globales)
            $table->unsignedBigInteger('resource_id')->nullable();

            // Anciennes valeurs (avant modification) — JSON
            $table->json('old_values')->nullable();

            // Nouvelles valeurs (après modification) — JSON
            $table->json('new_values')->nullable();

            // Adresse IP de la requête
            $table->string('ip_address', 45)->nullable();

            // User-Agent du navigateur/client
            $table->text('user_agent')->nullable();

            $table->timestamps();

            // Index pour les requêtes d'audit courantes
            $table->index('admin_id');
            $table->index('action');
            $table->index('resource');
            $table->index('created_at');
        });
    }

    /**
     * Supprimer la table des logs d'administration.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }
};
