<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Gallery extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'image',
    ];

    /**
     * Attributs ajoutés automatiquement lors de la sérialisation.
     *
     * @var array<int, string>
     */
    protected $appends = ['image_url'];

    /**
     * Accesseur pour obtenir l'URL publique de l'image.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $this->image), '/');

        return Storage::url($cleanPath);
    }

    /**
     * Relation : Une image de galerie appartient à un produit.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
