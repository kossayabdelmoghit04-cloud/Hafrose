<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Activation du CAPTCHA Cloudflare Turnstile
    |--------------------------------------------------------------------------
    |
    | Détermine si la vérification Turnstile est active globalement.
    | En désactivant cette option (TURNSTILE_ENABLED=false), aucun appel
    | réseau vers Cloudflare n'est effectué et tout token est accepté.
    | Indispensable pour les tests automatisés et les pipelines CI/CD.
    |
    */
    'enabled' => env('TURNSTILE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Clé secrète Turnstile (Secret Key)
    |--------------------------------------------------------------------------
    |
    | Clé fournie par Cloudflare dans le tableau de bord Turnstile.
    | Utilisée uniquement côté serveur pour vérifier les tokens.
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
    | En cas de dépassement, la ConnectionException est capturée
    | et l'accès est refusé de manière sécurisée.
    |
    */
    'timeout' => env('TURNSTILE_TIMEOUT', 5),

    /*
    |--------------------------------------------------------------------------
    | Canal de log
    |--------------------------------------------------------------------------
    |
    | Canal Laravel utilisé pour les warnings et erreurs de vérification
    | Turnstile (token invalide, timeout, erreur Cloudflare, config manquante).
    | Valeurs possibles : stack, single, daily, slack, etc.
    |
    */
    'log_channel' => env('TURNSTILE_LOG_CHANNEL', 'stack'),

];
