<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 5.1 — Optimisation des performances Backend
 *
 * Ajout d'index manquants identifiés lors de l'audit de performance :
 *
 *  • orders.created_at          — utilisé par getSalesChartData() (WHERE + GROUP BY DATE)
 *                                 et getLatestOrders() (ORDER BY created_at DESC)
 *
 *  • contacts.is_read           — utilisé par getMetrics() (WHERE is_read = 0)
 *
 *  • contacts.created_at        — utilisé par getLatestMessages() (ORDER BY created_at DESC)
 *                                 et ContactRepository::paginate() (ORDER BY created_at DESC)
 *
 *  • order_items (product_id)   — utilisé par getPopularProducts() (GROUP BY product_id + JOIN orders)
 *                                 Note : la FK constrained() crée déjà un index sur order_id.
 *                                 L'index sur product_id optimise le GROUP BY et le WITH eager load.
 *
 * Les index sur products.slug (unique), products.is_featured, reviews.is_approved,
 * orders.status, activity_logs.*, et admin_logs.* existent déjà via leurs migrations.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Optimise ORDER BY created_at DESC (getLatestOrders) et WHERE/GROUP BY DATE (getSalesChartData)
            $table->index('created_at', 'orders_created_at_idx');
        });

        Schema::table('contacts', function (Blueprint $table) {
            // Optimise WHERE is_read = 0 (getMetrics → unread_contacts)
            $table->index('is_read', 'contacts_is_read_idx');

            // Optimise ORDER BY created_at DESC (getLatestMessages, paginate)
            $table->index('created_at', 'contacts_created_at_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Optimise GROUP BY product_id dans getPopularProducts() (DashboardService + ProductRepository)
            $table->index('product_id', 'order_items_product_id_idx');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_created_at_idx');
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropIndex('contacts_is_read_idx');
            $table->dropIndex('contacts_created_at_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_product_id_idx');
        });
    }
};
