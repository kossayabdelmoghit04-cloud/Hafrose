<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

if (! app()->environment('testing', 'local')) {
    echo "⚠️ ERROR: seed_test_customer.php is forbidden in production environments.\n";
    exit(1);
}

$user = App\Models\User::firstOrCreate(
    ['email' => 'client@hafrose.com'],
    [
        'first_name' => 'Sophie',
        'last_name' => 'Laurent',
        'name' => 'Sophie Laurent',
        'password' => Illuminate\Support\Facades\Hash::make('Secret123!'),
        'role' => 'customer',
        'phone' => '+33612345678',
    ]
);

$user->password = Illuminate\Support\Facades\Hash::make('Secret123!');
$user->role = 'customer';
$user->save();

echo "User created/updated: " . $user->email . " with ID: " . $user->id . "\n";
