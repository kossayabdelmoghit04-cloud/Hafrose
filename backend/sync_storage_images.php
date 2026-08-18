<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Category;
use App\Models\Gallery;
use Illuminate\Support\Facades\File;

$storagePublic = storage_path('app/public');
$productsDir = $storagePublic . '/products';
$galleryDir = $productsDir . '/gallery';
$categoriesDir = $storagePublic . '/categories';
$heroDir = $storagePublic . '/hero';
$bannersDir = $storagePublic . '/banners';

File::ensureDirectoryExists($productsDir);
File::ensureDirectoryExists($galleryDir);
File::ensureDirectoryExists($categoriesDir);
File::ensureDirectoryExists($heroDir);
File::ensureDirectoryExists($bannersDir);

// 1. Categories images
$categorySourceMap = [
    'sacs' => public_path('images/products/sacs/sac-signature-blanc.jpg'),
    'bijoux' => public_path('images/products/bijoux/collier-gold.jpg'),
    'montres' => public_path('images/products/montres/montre-classique-or.jpg'),
    'lunettes' => public_path('images/products/lunettes/lunettes-aviateur-or.jpg'),
    'ceintures' => public_path('images/products/ceintures/ceinture-classic.jpg'),
    'portefeuilles' => public_path('images/products/portefeuilles/portefeuille-croco-noir.jpg'),
];

foreach (Category::all() as $cat) {
    $target = $categoriesDir . '/' . $cat->slug . '.jpg';
    if (!File::exists($target)) {
        $source = $categorySourceMap[$cat->slug] ?? null;
        if ($source && File::exists($source)) {
            File::copy($source, $target);
            echo "Copied category image: {$cat->slug}.jpg\n";
        } elseif (File::exists(public_path('assets/images/category-bags.jpg'))) {
            File::copy(public_path('assets/images/category-bags.jpg'), $target);
        }
    }
}

// 2. Hero and Banners
if (File::exists(public_path('assets/images/hero-main.png')) && !File::exists($heroDir . '/hero-main.png')) {
    File::copy(public_path('assets/images/hero-main.png'), $heroDir . '/hero-main.png');
    echo "Copied hero-main.png\n";
}
if (File::exists(public_path('assets/images/new-collection.jpg')) && !File::exists($bannersDir . '/new-collection.jpg')) {
    File::copy(public_path('assets/images/new-collection.jpg'), $bannersDir . '/new-collection.jpg');
    echo "Copied new-collection.jpg\n";
}
if (File::exists(public_path('assets/images/promo-banner.jpg')) && !File::exists($bannersDir . '/promo-banner.jpg')) {
    File::copy(public_path('assets/images/promo-banner.jpg'), $bannersDir . '/promo-banner.jpg');
    echo "Copied promo-banner.jpg\n";
}

// 3. Products images
$categoryFiles = [];
foreach (['sacs', 'bijoux', 'montres', 'lunettes', 'ceintures', 'portefeuilles'] as $cat) {
    $dir = public_path("images/products/{$cat}");
    if (File::isDirectory($dir)) {
        $categoryFiles[$cat] = File::files($dir);
    }
}

$allFallbackFiles = File::allFiles(public_path('images/products'));

foreach (Product::with('category', 'galleries')->get() as $idx => $p) {
    $catSlug = $p->category->slug ?? 'sacs';
    $availableFiles = $categoryFiles[$catSlug] ?? $allFallbackFiles;
    $sourceFile = $availableFiles[$idx % count($availableFiles)]->getRealPath();

    // Product main image
    $imageBasename = basename($p->image);
    $targetPath = $productsDir . '/' . $imageBasename;
    if (!File::exists($targetPath) && File::exists($sourceFile)) {
        File::copy($sourceFile, $targetPath);
        echo "Copied product image: {$imageBasename}\n";
    }

    // Product galleries
    foreach ($p->galleries as $gIdx => $g) {
        $galleryBasename = basename($g->image);
        $galleryTarget = $galleryDir . '/' . $galleryBasename;
        if (!File::exists($galleryTarget)) {
            $gSource = $availableFiles[($idx + $gIdx + 1) % count($availableFiles)]->getRealPath();
            if (File::exists($gSource)) {
                File::copy($gSource, $galleryTarget);
            }
        }
    }
}

echo "Image sync complete!\n";
