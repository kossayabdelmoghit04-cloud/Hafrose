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
        // Créer l'administrateur principal
        $admin = User::create([
            'name' => 'Hafrose Admin',
            'email' => 'admin@hafrose.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
        ]);

        // Assigner le rôle Spatie à l'administrateur
        $admin->assignRole('admin');
    }
}
