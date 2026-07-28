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
        // 1. Loyalty Program Tables
        Schema::create('loyalty_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('points_balance')->default(0);
            $table->integer('lifetime_points')->default(0);
            $table->string('tier')->default('Bronze'); // Bronze, Silver, Gold, Platinum
            $table->timestamps();
        });

        Schema::create('loyalty_rewards', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('points_cost');
            $table->decimal('discount_amount', 10, 2);
            $table->string('code')->unique();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 2. Gift Cards Table
        Schema::create('gift_cards', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->decimal('initial_balance', 10, 2);
            $table->decimal('current_balance', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // 3. Marketing Automations & Cart Abandonment
        Schema::create('marketing_automations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('trigger_type'); // abandoned_cart, product_viewed, inactivity, birthday
            $table->integer('discount_percent')->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cart_abandonments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->json('items_json');
            $table->boolean('recovered')->default(false);
            $table->timestamp('recovered_at')->nullable();
            $table->timestamps();
        });

        // 4. Marketplace Sellers & Stores
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('store_name');
            $table->string('slug')->unique();
            $table->decimal('commission_rate', 5, 2)->default(10.00); // 10%
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('bio')->nullable();
            $table->string('logo_url')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->timestamps();
        });

        // 5. Enterprise Webhooks
        Schema::create('webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('secret');
            $table->json('events');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Mobile App Device Tokens
        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('platform')->default('ios'); // ios, android, web
            $table->timestamps();
        });

        // 7. Security Audit & 2FA
        Schema::create('security_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
        });

        Schema::create('two_factor_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('secret');
            $table->boolean('is_enabled')->default(false);
            $table->json('recovery_codes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('two_factor_credentials');
        Schema::dropIfExists('security_audit_logs');
        Schema::dropIfExists('device_tokens');
        Schema::dropIfExists('webhooks');
        Schema::dropIfExists('stores');
        Schema::dropIfExists('sellers');
        Schema::dropIfExists('cart_abandonments');
        Schema::dropIfExists('marketing_automations');
        Schema::dropIfExists('gift_cards');
        Schema::dropIfExists('loyalty_rewards');
        Schema::dropIfExists('loyalty_accounts');
    }
};
