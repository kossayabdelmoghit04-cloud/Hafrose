<?php

$isProduction = (string) config('app.env', env('APP_ENV', 'production')) === 'production';
$defaultOrigins = $isProduction
    ? ['https://hafrose.com', 'https://www.hafrose.com', 'https://api.hafrose.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];
$configuredOrigins = array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
));

if ($isProduction) {
    $configuredOrigins = array_filter($configuredOrigins, static function (string $origin): bool {
        $host = strtolower((string) parse_url($origin, PHP_URL_HOST));

        return ! in_array($host, ['localhost', '127.0.0.1', '::1'], true);
    });
}

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_unique(array_merge($defaultOrigins, $configuredOrigins))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN'],

    'exposed_headers' => [],

    'max_age' => 0,

    // L'architecture HAFROSE utilise des Bearer tokens, pas des cookies SPA cross-origin.
    'supports_credentials' => false,

];
