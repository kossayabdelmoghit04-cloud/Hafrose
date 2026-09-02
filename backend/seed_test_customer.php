<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

if (! app()->environment('testing', 'local')) {
    echo "⚠️ ERROR: seed_test_customer.php is forbidden in production environments.\n";
    exit(1);
}

$user = User::firstOrCreate(
    ['email' => 'client@hafrose.com'],
    [
        'first_name' => 'Sophie',
        'last_name' => 'Laurent',
        'name' => 'Sophie Laurent',
        'password' => Hash::make('Secret123!'),
        'role' => 'customer',
        'phone' => '+33612345678',
    ]
);

$user->password = Hash::make('Secret123!');
$user->role = 'customer';
$user->save();

echo 'User created/updated: '.$user->email.' with ID: '.$user->id."\n";
