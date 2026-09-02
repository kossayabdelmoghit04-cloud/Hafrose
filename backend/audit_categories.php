<?php

use App\Models\Category;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$categories = Category::select('id', 'name', 'slug', 'image')
    ->withCount('products')
    ->get();

echo "=== DATABASE AUDIT ===\n";
foreach ($categories as $c) {
    echo "ID: {$c->id} | Name: {$c->name} | Slug: {$c->slug} | Image: {$c->image} | Products: {$c->products_count}\n";
}

echo "\n=== EXPECTED IMAGE FIELDS ===\n";
$expected = ['sacs', 'bijoux', 'montres', 'lunettes', 'ceintures', 'portefeuilles'];
foreach ($categories as $c) {
    $expectedImage = 'categories/'.$c->slug.'.jpg';
    $match = $c->image === $expectedImage ? 'PASS' : 'FAIL (expected: '.$expectedImage.')';
    echo "{$c->name}: image={$c->image} => {$match}\n";
}

echo "\n=== STORAGE FILES ===\n";
$storageBase = __DIR__.'/storage/app/public/categories/';
foreach (['sacs', 'bijoux', 'montres', 'lunettes', 'ceintures', 'portefeuilles'] as $slug) {
    $file = $storageBase.$slug.'.jpg';
    if (file_exists($file)) {
        $size = filesize($file);
        $hash = md5_file($file);
        echo "{$slug}.jpg: EXISTS | size={$size} bytes | md5={$hash}\n";
    } else {
        echo "{$slug}.jpg: MISSING\n";
    }
}

echo "\n=== STORAGE LINK CHECK ===\n";
$publicStorage = __DIR__.'/public/storage';
if (is_link($publicStorage)) {
    $target = readlink($publicStorage);
    echo "public/storage -> {$target}\n";
    $expectedTarget = __DIR__.'/storage/app/public';
    echo "Expected: {$expectedTarget}\n";
    echo 'Match: '.(realpath($target) === realpath($expectedTarget) ? 'PASS' : 'FAIL')."\n";
} elseif (is_dir($publicStorage)) {
    echo "public/storage is a DIRECTORY (not a symlink) - may be issue on Windows\n";
} else {
    echo "public/storage: DOES NOT EXIST\n";
}
