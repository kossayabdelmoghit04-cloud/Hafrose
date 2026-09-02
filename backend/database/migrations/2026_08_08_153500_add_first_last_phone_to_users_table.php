<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * PATCH 8.2.3 — P1 User Identity Contract Synchronization
 *
 * Adds canonical first_name, last_name, phone columns to the users table.
 * Backfills existing rows by splitting the legacy `name` field on the first space.
 * The `name` column is NOT dropped for rollback safety and backward compatibility
 * with any legacy admin references.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add after the existing `name` column for clarity
            $table->string('first_name', 100)->nullable()->after('name');
            $table->string('last_name', 100)->nullable()->after('first_name');
            $table->string('phone', 30)->nullable()->after('email');
        });

        // Backfill: split legacy `name` → first_name + last_name
        DB::table('users')
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->orderBy('id')
            ->each(function ($user) {
                $parts = explode(' ', trim($user->name), 2);
                $firstName = $parts[0] ?? '';
                $lastName = $parts[1] ?? '';

                DB::table('users')->where('id', $user->id)->update([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'phone']);
        });
    }
};
