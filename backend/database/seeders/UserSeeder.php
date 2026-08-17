<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un client de test par défaut pour les tests clients et non-régression
        User::firstOrCreate(
            ['email' => 'client.test@hafrose.com'],
            [
                'name' => 'Client Test',
                'first_name' => 'Client',
                'last_name' => 'Test',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );
    }
}
