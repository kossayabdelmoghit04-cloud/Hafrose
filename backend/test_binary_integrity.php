<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$client = new \GuzzleHttp\Client();
$categories = \App\Models\Category::all();

echo "=== BINARY INTEGRITY AUDIT ===\n";
foreach ($categories as $cat) {
    $fullUrl = 'http://localhost:8000' . $cat->image_url;
    $response = $client->get($fullUrl);
    $httpBody = (string) $response->getBody();
    $httpMd5 = md5($httpBody);

    $cleanPath = ltrim(str_replace('/storage/', '', $cat->image), '/');
    $diskPath = storage_path('app/public/' . $cleanPath);
    $diskMd5 = file_exists($diskPath) ? md5_file($diskPath) : 'FILE_NOT_FOUND';

    $match = ($httpMd5 === $diskMd5) ? 'PASS (100% Exact Match)' : 'FAIL';
    echo "Category: {$cat->name} ({$cat->slug})\n";
    echo "  - URL: {$fullUrl}\n";
    echo "  - HTTP Status: {$response->getStatusCode()}\n";
    echo "  - HTTP Size: " . strlen($httpBody) . " bytes\n";
    echo "  - HTTP MD5: {$httpMd5}\n";
    echo "  - Disk MD5: {$diskMd5}\n";
    echo "  - Binary Match: {$match}\n\n";
}
