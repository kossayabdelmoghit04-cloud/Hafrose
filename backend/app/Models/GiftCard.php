<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'initial_balance',
        'current_balance',
        'currency',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'initial_balance' => 'float',
        'current_balance' => 'float',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];
}
