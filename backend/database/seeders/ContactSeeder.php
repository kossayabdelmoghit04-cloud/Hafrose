<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer 5 demandes de contact réalistes en français (définies dans la factory)
        Contact::factory()->count(5)->create();
    }
}
