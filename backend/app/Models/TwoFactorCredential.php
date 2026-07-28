<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwoFactorCredential extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'secret',
        'is_enabled',
        'recovery_codes',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'recovery_codes' => 'array',
    ];
}
