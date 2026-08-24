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
        // Strict environment guard: test users must never be created outside testing
        if (! app()->environment('testing')) {
            $this->command?->warn('⚠️ UserSeeder is restricted to testing environment. Skipping execution.');
            return;
        }

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
