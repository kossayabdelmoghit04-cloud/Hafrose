<?php
// Check existing image sizes on disk
$dirs = [
    'products' => __DIR__ . '/storage/app/public/products',
    'categories' => __DIR__ . '/storage/app/public/categories',
    'hero' => __DIR__ . '/storage/app/public/hero',
    'banners' => __DIR__ . '/storage/app/public/banners',
    'gallery' => __DIR__ . '/storage/app/public/products/gallery',
];

foreach ($dirs as $label => $dir) {
    echo "=== $label ===\n";
    if (!is_dir($dir)) { echo "  [NOT FOUND]\n"; continue; }
    $files = glob($dir . '/*.{jpg,jpeg,png,webp,gif}', GLOB_BRACE);
    $totalBytes = 0;
    $count = 0;
    foreach ($files as $f) {
        $size = filesize($f);
        $totalBytes += $size;
        $count++;
        $info = @getimagesize($f);
        $w = $info ? $info[0] : '?';
        $h = $info ? $info[1] : '?';
        $mime = $info ? $info['mime'] : '?';
        echo sprintf("  %-60s %6d KB  %sx%s  %s\n", basename($f), round($size/1024), $w, $h, $mime);
    }
    echo "  TOTAL: $count files, " . round($totalBytes/1024) . " KB avg:" . ($count ? round($totalBytes/$count/1024) : 0) . " KB\n\n";
}
