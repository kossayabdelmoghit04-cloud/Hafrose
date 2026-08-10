<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$product = App\Models\Product::where('name', 'LIKE', '%Sac Cabas Signature Bordeaux%')->first();
if (!$product) {
    $product = App\Models\Product::orderBy('id', 'desc')->first();
}

if ($product) {
    echo "FOUND: ID={$product->id} | Name={$product->name} | Old Image={$product->image}\n";
    $product->image = 'products/sac-cabas-signature-bordeaux.jpg';
    $product->save();
    echo "UPDATED: ID={$product->id} | New Image={$product->image}\n";
} else {
    echo "NO PRODUCTS FOUND IN DATABASE\n";
}
