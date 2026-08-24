<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Appel des seeders de production / domaine (rôles, catégories, produits, paramètres...)
        $this->call([
            RoleAndPermissionSeeder::class,
            AdminUserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
            ContactSeeder::class,
            ReviewSeeder::class,
            SettingSeeder::class,
        ]);

        // 2. Seeders de test STRICTEMENT réservés à l'environnement "testing"
        if (app()->environment('testing')) {
            $this->call([
                TestCustomerSeeder::class,
            ]);
        }
    }
}
