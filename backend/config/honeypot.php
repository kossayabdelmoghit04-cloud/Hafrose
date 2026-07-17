<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Activation du Honeypot
    |--------------------------------------------------------------------------
    |
    | Détermine si la protection anti-spam Honeypot est active globalement.
    |
    */
    'enabled' => env('HONEYPOT_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Nom du champ Honeypot
    |--------------------------------------------------------------------------
    |
    | Le nom du champ de saisie masqué dans le formulaire HTML. Les robots
    | analyseront la page et rempliront ce champ, ce qui déclenchera le blocage.
    |
    */
    'field_name' => env('HONEYPOT_FIELD_NAME', 'website'),
];
