<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Find the DB port
$portResult = DB::select("SHOW VARIABLES LIKE 'port'");
$port = $portResult[0]->Value ?? 'unknown';
echo "MySQL port: {$port}\n";

// List products
$products = DB::select('SELECT id, name, image FROM products ORDER BY id DESC LIMIT 5');
echo 'Products count: '.count($products)."\n";
foreach ($products as $p) {
    echo "ID={$p->id} | Name={$p->name} | Image={$p->image}\n";
}
