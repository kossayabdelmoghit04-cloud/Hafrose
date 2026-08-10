<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Find the DB port
$portResult = \Illuminate\Support\Facades\DB::select("SHOW VARIABLES LIKE 'port'");
$port = $portResult[0]->Value ?? 'unknown';
echo "MySQL port: {$port}\n";

// List products
$products = \Illuminate\Support\Facades\DB::select("SELECT id, name, image FROM products ORDER BY id DESC LIMIT 5");
echo "Products count: " . count($products) . "\n";
foreach ($products as $p) {
    echo "ID={$p->id} | Name={$p->name} | Image={$p->image}\n";
}
