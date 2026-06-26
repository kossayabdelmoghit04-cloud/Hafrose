<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * Relation : Une image de galerie appartient à un produit.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
