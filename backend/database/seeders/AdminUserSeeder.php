<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Crée le rôle admin, ses permissions et le compte administrateur par défaut.
     */
    public function run(): void
    {
        // Réinitialiser le cache de permissions Spatie pour éviter les conflits de migration
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Créer les permissions d'administration ---
        $permissions = [
            'manage categories',
            'manage products',
            'manage orders',
            'manage reviews',
            'manage contacts',
            'manage settings',
            'manage media',
            'view dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // --- Créer le rôle admin avec toutes les permissions ---
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions($permissions);

        // --- Créer le super-administrateur ---
        $admin = User::firstOrCreate(
            ['email' => 'admin@hafrose.com'],
            [
                'name'     => 'Administrateur Hafrose',
                'password' => Hash::make('Admin@Hafrose2024!'),
                'role'     => User::ROLE_ADMIN,
            ]
        );

        // Assigner le rôle Spatie
        $admin->assignRole($adminRole);

        $this->command->info('✅ Compte administrateur créé : admin@hafrose.com / Admin@Hafrose2024!');
    }
}
