<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
