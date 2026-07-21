<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Activation du Honeypot
    |--------------------------------------------------------------------------
    |
    | Détermine si la protection anti-spam Honeypot est active globalement.
    | Mettre à false en environnement de test automatisé si nécessaire,
    | ou configurer via la variable d'environnement HONEYPOT_ENABLED.
    |
    */
    'enabled' => env('HONEYPOT_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Nom du champ Honeypot
    |--------------------------------------------------------------------------
    |
    | Le nom du champ de saisie masqué dans le formulaire HTML.
    | Les robots parcourent la page et remplissent ce champ automatiquement,
    | ce qui déclenche le blocage.
    |
    | Ce champ doit être rendu invisible en CSS (display:none ou position:absolute
    | avec overflow:hidden). Ne jamais utiliser type="hidden" car certains
    | robots ignorent ces champs.
    |
    */
    'field_name' => env('HONEYPOT_FIELD', 'website'),

    /*
    |--------------------------------------------------------------------------
    | Canal de log
    |--------------------------------------------------------------------------
    |
    | Canal Laravel utilisé pour enregistrer les warnings de détection de bot.
    | Valeurs possibles : stack, single, daily, slack, etc.
    | Configurable via HONEYPOT_LOG_CHANNEL.
    |
    */
    'log_channel' => env('HONEYPOT_LOG_CHANNEL', 'stack'),

    /*
    |--------------------------------------------------------------------------
    | Shadow Block (Réponse fantôme)
    |--------------------------------------------------------------------------
    |
    | Lorsque true (défaut), le middleware retourne une réponse HTTP 201 factice
    | au lieu d'une erreur 400/403. Cette stratégie empêche le bot de détecter
    | qu'il a été bloqué, ce qui réduit les tentatives répétées.
    |
    | Mettre à false pour retourner une réponse d'erreur explicite.
    |
    */
    'shadow_block' => env('HONEYPOT_SHADOW_BLOCK', true),

    /*
    |--------------------------------------------------------------------------
    | Message d'erreur (Shadow Block désactivé)
    |--------------------------------------------------------------------------
    |
    | Message JSON retourné lorsque shadow_block est false et qu'un bot
    | est détecté. Ce message est délibérément vague.
    |
    */
    'error_message' => env('HONEYPOT_ERROR_MESSAGE', 'Requête invalide.'),

];
