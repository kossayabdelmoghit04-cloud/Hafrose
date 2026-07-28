<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltyReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'points_cost',
        'discount_amount',
        'code',
        'active',
    ];

    protected $casts = [
        'points_cost' => 'integer',
        'discount_amount' => 'float',
        'active' => 'boolean',
    ];
}
