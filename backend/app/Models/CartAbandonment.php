<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * CartAbandonment — Modèle de relance de panier abandonné (CAS B : Fonctionnalité future V2 Enterprise).
 *
 * Statut : Schéma DB créé via migration 2026_07_28_100000_create_v2_enterprise_tables.
 * Implémentation prévue : Job de relance par email après inactivité sur panier non converti.
 * Non exposé sur les routes API actuelles.
 */
class CartAbandonment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'items_json',
        'recovered',
        'recovered_at',
    ];

    protected $casts = [
        'items_json' => 'array',
        'recovered' => 'boolean',
        'recovered_at' => 'datetime',
    ];
}
