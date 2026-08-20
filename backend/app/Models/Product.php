<?php

namespace App\Models;

use App\Services\ImageOptimizationService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'sale_price',
        'stock',
        'color',
        'material',
        'brand',
        'image',
        'is_featured',
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'is_featured' => 'boolean',
    ];

    /**
     * Attributs ajoutés automatiquement lors de la sérialisation.
     *
     * @var array<int, string>
     */
    protected $appends = ['image_url', 'image_card_url', 'image_thumb_url', 'is_on_sale', 'discount_percentage'];

    /**
     * Scope pour filtrer les produits en promotion / soldes.
     */
    public function scopeOnSale($query)
    {
        return $query->whereNotNull('sale_price')
            ->where('sale_price', '>', 0)
            ->whereColumn('sale_price', '<', 'price');
    }

    /**
     * Vérifie si le produit est actuellement soldé.
     */
    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null 
            && (float) $this->sale_price > 0 
            && (float) $this->sale_price < (float) $this->price;
    }

    /**
     * Calcule le pourcentage de réduction en solde (entier arrondi).
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (! $this->is_on_sale || (float) $this->price <= 0) {
            return null;
        }

        $discount = (($this->price - $this->sale_price) / $this->price) * 100;

        return (int) round($discount);
    }

    /**
     * Accesseur pour obtenir l'URL publique de l'image principale (originale).
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
     * Accesseur pour l'URL de la variante optimisée pour les cartes produits (480×640).
     * Retourne null si la variante n'existe pas encore (images existantes non encore migrées).
     * Le frontend utilise alors image_url comme fallback.
     */
    public function getImageCardUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return null; // Les URLs externes n'ont pas de variantes locales
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $this->image), '/');

        return app(ImageOptimizationService::class)->getVariantUrl($cleanPath, 'card');
    }

    /**
     * Accesseur pour l'URL de la variante miniature (120×160) — thumbnails galerie.
     * Retourne null si la variante n'existe pas.
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
     * Relation : Un produit appartient à une catégorie.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relation : Un produit possède plusieurs images de galerie.
     */
    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    /**
     * Relation : Un produit possède plusieurs avis clients.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relation : Un produit peut être associé à plusieurs lignes de commande.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Relation : Un produit peut être dans plusieurs favoris.
     */
    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }
}
