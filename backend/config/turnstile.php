<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Activation du CAPTCHA Cloudflare Turnstile
    |--------------------------------------------------------------------------
    |
    | Détermine si la vérification Turnstile est active globalement.
    | En désactivant cette option (tests automatisés, CI), aucun appel
    | réseau vers Cloudflare n'est effectué et tout token est accepté.
    |
    */
    'enabled' => env('TURNSTILE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Clé secrète Turnstile (Secret Key)
    |--------------------------------------------------------------------------
    |
    | Clé fournie par Cloudflare dans le tableau de bord Turnstile.
    | Elle est utilisée uniquement côté serveur pour vérifier les tokens.
    | Ne jamais exposer cette valeur dans le code source ou le frontend.
    |
    */
    'secret_key' => env('TURNSTILE_SECRET_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Clé de site Turnstile (Site Key)
    |--------------------------------------------------------------------------
    |
    | Clé publique fournie par Cloudflare. Transmise au frontend via
    | la variable d'environnement VITE_TURNSTILE_SITE_KEY.
    | Peut être incluse dans le code source.
    |
    */
    'site_key' => env('TURNSTILE_SITE_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | URL de vérification Cloudflare
    |--------------------------------------------------------------------------
    |
    | Endpoint de l'API Cloudflare Turnstile.
    | Ne pas modifier sauf si Cloudflare change cette URL.
    |
    */
    'verify_url' => env('TURNSTILE_VERIFY_URL', 'https://challenges.cloudflare.com/turnstile/v0/siteverify'),

    /*
    |--------------------------------------------------------------------------
    | Timeout de la requête HTTP (secondes)
    |--------------------------------------------------------------------------
    |
    | Durée maximale accordée à la requête vers l'API Cloudflare.
    | En cas de dépassement, l'erreur réseau est gérée proprement.
    |
    */
    'timeout' => env('TURNSTILE_TIMEOUT', 5),
];
