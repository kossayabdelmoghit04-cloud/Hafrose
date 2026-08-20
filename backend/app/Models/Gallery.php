<?php

namespace App\Models;

use App\Services\ImageOptimizationService;
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
    protected $appends = ['image_url', 'image_thumb_url'];

    /**
     * Accesseur pour obtenir l'URL publique de l'image (originale).
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
     * Accesseur pour l'URL de la variante miniature (120×160).
     * Utilisée pour les thumbnails de la galerie dans ProductDetailPage.
     * Retourne null si la variante n'existe pas (images existantes non encore migrées).
     */
    public function getImageThumbUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return null;
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $this->image), '/');

        return app(ImageOptimizationService::class)->getVariantUrl($cleanPath, 'thumb');
    }

    /**
     * Relation : Une image de galerie appartient à un produit.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
