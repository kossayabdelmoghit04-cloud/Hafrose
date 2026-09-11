<?php

return [
    'enabled' => (bool) env('ADMIN_SEED_ENABLED', false),
    'name' => env('ADMIN_SEED_NAME', 'Administrateur Hafrose'),
    'email' => env('ADMIN_SEED_EMAIL'),
    'password' => env('ADMIN_SEED_PASSWORD'),
];
