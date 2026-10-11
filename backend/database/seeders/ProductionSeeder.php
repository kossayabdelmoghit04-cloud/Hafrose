<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            SettingSeeder::class,
            // This seeder is a no-op unless ADMIN_SEED_ENABLED and credentials
            // are supplied explicitly by the operator.
            AdminUserSeeder::class,
        ]);
    }
}
