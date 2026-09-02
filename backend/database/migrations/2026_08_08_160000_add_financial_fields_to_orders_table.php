<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * PATCH 8.2.4 — Enterprise Order Financial Contract & Checkout Synchronization
 *
 * Adds canonical financial and logistics fields to the orders table.
 * Backfills existing orders to maintain full backward compatibility.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number', 50)->nullable()->after('id')->index();
            $table->string('postal_code', 20)->nullable()->after('city');
            $table->string('country', 100)->default('France')->after('postal_code');
            $table->decimal('subtotal_amount', 10, 2)->default(0.00)->after('total_price');
            $table->decimal('tax_amount', 10, 2)->default(0.00)->after('subtotal_amount');
            $table->decimal('shipping_amount', 10, 2)->default(0.00)->after('tax_amount');
            $table->string('shipping_method', 50)->default('express')->after('shipping_amount');
            $table->string('payment_method', 50)->default('card')->after('shipping_method');
            $table->string('payment_status', 50)->default('paid')->after('payment_method');
            $table->decimal('total_amount', 10, 2)->default(0.00)->after('payment_status');
        });

        // Backfill existing rows
        DB::table('orders')->orderBy('id')->each(function ($order) {
            $orderNum = 'HF-'.str_pad((string) $order->id, 6, '0', STR_PAD_LEFT);
            $subtotal = (float) $order->total_price;
            $tax = round($subtotal - ($subtotal / 1.2), 2);
            $total = $subtotal; // default 0 shipping for backfill

            DB::table('orders')->where('id', $order->id)->update([
                'order_number' => $orderNum,
                'subtotal_amount' => $subtotal,
                'tax_amount' => $tax,
                'shipping_amount' => 0.00,
                'total_amount' => $total,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_number',
                'postal_code',
                'country',
                'subtotal_amount',
                'tax_amount',
                'shipping_amount',
                'shipping_method',
                'payment_method',
                'payment_status',
                'total_amount',
            ]);
        });
    }
};
