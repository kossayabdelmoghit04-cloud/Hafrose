<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Réinitialiser le cache des rôles et permissions de Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Définir les permissions clés
        $permissions = [
            'manage dashboard',
            'manage categories',
            'manage products',
            'manage orders',
            'manage reviews',
            'manage contacts',
        ];

        // Créer les permissions
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Créer le rôle administrateur et lui affecter toutes les permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
