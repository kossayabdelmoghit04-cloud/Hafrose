<?php

namespace App\Models;

use App\Services\ImageOptimizationService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Category extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
    ];

    /**
     * Attributs ajoutés automatiquement lors de la sérialisation.
     *
     * @var array<int, string>
     */
    protected $appends = ['image_url', 'image_card_url'];

    /**
     * Accesseur pour obtenir l'URL publique de l'image (originale, avec cache-busting).
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
        $fullPath = storage_path('app/public/'.$cleanPath);
        $v = file_exists($fullPath) ? filemtime($fullPath) : ($this->updated_at ? $this->updated_at->timestamp : '1');

        return Storage::url($cleanPath).'?v='.$v;
    }

    /**
     * Accesseur pour l'URL de la variante optimisée pour les cartes catégories (480×640).
     * Retourne null si la variante n'existe pas encore (images existantes non encore migrées).
     * Le frontend utilise alors image_url comme fallback.
     */
    public function getImageCardUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return null;
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $this->image), '/');

        return app(ImageOptimizationService::class)->getVariantUrl($cleanPath, 'card');
    }

    /**
     * Relation : Une catégorie possède plusieurs produits.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
