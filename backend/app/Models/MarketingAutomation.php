<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * MarketingAutomation — Modèle d'automatisation marketing (CAS B : Fonctionnalité future V2 Enterprise).
 *
 * Statut : Schéma DB créé via migration 2026_07_28_100000_create_v2_enterprise_tables.
 * Implémentation prévue : Déclencheurs promotionnels automatiques (anniversaire, inactivité, fidélité).
 * Non exposé sur les routes API actuelles.
 */
class MarketingAutomation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'trigger_type',
        'discount_percent',
        'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'is_active' => 'boolean',
    ];
}
