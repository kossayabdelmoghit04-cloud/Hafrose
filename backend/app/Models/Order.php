<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * Statuts possibles d'une commande
     */
    public const STATUS_PENDING = 'En attente';
    public const STATUS_CONFIRMED = 'Confirmée';
    public const STATUS_SHIPPED = 'Expédiée';
    public const STATUS_DELIVERED = 'Livrée';
    public const STATUS_CANCELLED = 'Annulée';

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_name',
        'phone',
        'address',
        'city',
        'total_price',
        'status',
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_price' => 'decimal:2',
    ];

    /**
     * Relation : Une commande possède plusieurs lignes de commande.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Recalculer le prix total de la commande basé sur ses articles.
     */
    public function recalculateTotal(): void
    {
        $this->total_price = $this->orderItems()->sum('subtotal');
        $this->save();
    }
}
