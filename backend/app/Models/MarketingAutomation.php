<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
