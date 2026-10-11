<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DevelopmentSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('DevelopmentSeeder refused to run in production.');

            return;
        }

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
            ContactSeeder::class,
            ReviewSeeder::class,
        ]);
    }
}
