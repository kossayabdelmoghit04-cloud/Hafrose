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
        Schema::table('admin_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_logs', 'description')) {
                $table->string('description', 255)->nullable()->after('resource_id');
            }
            if (!Schema::hasColumn('admin_logs', 'url')) {
                $table->string('url', 500)->nullable()->after('user_agent');
            }
            if (!Schema::hasColumn('admin_logs', 'method')) {
                $table->string('method', 10)->nullable()->after('url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admin_logs', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('admin_logs', 'description')) {
                $columns[] = 'description';
            }
            if (Schema::hasColumn('admin_logs', 'url')) {
                $columns[] = 'url';
            }
            if (Schema::hasColumn('admin_logs', 'method')) {
                $columns[] = 'method';
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
