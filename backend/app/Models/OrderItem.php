<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /**
     * Relation : Une ligne de commande appartient à une commande.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relation : Une ligne de commande est associée à un produit (qui peut être nul si supprimé).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Le cycle de vie d'un OrderItem.
     */
    protected static function booted(): void
    {
        // Calcul automatique du sous-total avant sauvegarde (création ou modification)
        static::saving(function (OrderItem $item) {
            $item->subtotal = $item->quantity * $item->unit_price;
        });

        // Recalcul du total de la commande après insertion ou mise à jour
        static::saved(function (OrderItem $item) {
            if ($item->order) {
                $item->order->recalculateTotal();
            }
        });

        // Recalcul du total de la commande après suppression
        static::deleted(function (OrderItem $item) {
            if ($item->order) {
                $item->order->recalculateTotal();
            }
        });
    }
}
