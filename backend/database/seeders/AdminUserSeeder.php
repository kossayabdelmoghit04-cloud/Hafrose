<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminUserSeeder extends Seeder
{
    /**
     * Crée le rôle admin, ses permissions et le compte administrateur par défaut.
     */
    public function run(): void
    {
        $email = config('admin-seeder.email');
        $password = config('admin-seeder.password');

        if (! config('admin-seeder.enabled') || ! $email || ! $password) {
            $this->command?->warn('Admin account seeding skipped: explicit credentials are required.');

            return;
        }

        // Réinitialiser le cache de permissions Spatie pour éviter les conflits de migration
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

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

        // --- Créer ou mettre à jour le super-administrateur ---
        $admin = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => config('admin-seeder.name'),
                'password' => Hash::make($password),
                'role' => User::ROLE_ADMIN,
            ]
        );

        // Assigner le rôle Spatie
        $admin->assignRole($adminRole);

        $this->command?->info('Admin account created from environment-provided credentials.');
    }
}
