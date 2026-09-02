<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'user_id',
        'order_number',
        'customer_name',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'subtotal_amount',
        'tax_amount',
        'shipping_amount',
        'shipping_method',
        'payment_method',
        'payment_status',
        'total_amount',
        'total_price',
        'status',
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Relation : Une commande appartient à un utilisateur (optionnel pour les invités).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation : Une commande possède plusieurs lignes de commande.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Recalculer le prix total et la ventilation financière de la commande.
     */
    public function recalculateTotal(): void
    {
        $itemsSubtotal = (float) $this->orderItems()->sum('subtotal');
        $shipping = (float) ($this->shipping_amount ?? 0);
        $total = $itemsSubtotal + $shipping;

        $this->subtotal_amount = $itemsSubtotal;
        $this->tax_amount = round($itemsSubtotal - ($itemsSubtotal / 1.2), 2);
        $this->total_amount = $total;
        $this->total_price = $total;

        if (empty($this->order_number)) {
            $this->order_number = 'HF-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
        }

        $this->saveQuietly();
    }
}
