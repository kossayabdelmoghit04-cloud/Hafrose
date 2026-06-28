<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'filename',
        'path',
        'mime_type',
        'size',
    ];

    /**
     * Attribut virtuel pour obtenir l'URL complète du fichier.
     *
     * @var array<int, string>
     */
    protected $appends = ['url'];

    /**
     * Accesseur pour obtenir l'URL publique de l'image.
     */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }
}
