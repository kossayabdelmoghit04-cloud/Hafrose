<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modèle représentant une entrée du journal d'activité global.
 *
 * @property int            $id
 * @property int|null       $user_id
 * @property string         $event_type
 * @property string         $category
 * @property string|null    $resource
 * @property int|null       $resource_id
 * @property string|null    $ip_address
 * @property string|null    $user_agent
 * @property array|null     $metadata
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class ActivityLog extends Model
{
    // ─── Catégories d'événements ───────────────────────────────────────────────

    public const CATEGORY_AUTH     = 'auth';
    public const CATEGORY_ORDER    = 'order';
    public const CATEGORY_WISHLIST = 'wishlist';
    public const CATEGORY_CONTACT  = 'contact';
    public const CATEGORY_REVIEW   = 'review';

    // ─── Types d'événements spécifiques ────────────────────────────────────────

    public const EVENT_USER_REGISTERED       = 'auth.register';
    public const EVENT_USER_LOGIN            = 'auth.login';
    public const EVENT_USER_LOGOUT           = 'auth.logout';
    public const EVENT_ORDER_CREATED         = 'order.created';
    public const EVENT_ORDER_STATUS_CHANGED  = 'order.status_changed';
    public const EVENT_WISHLIST_ADDED        = 'wishlist.added';
    public const EVENT_WISHLIST_REMOVED      = 'wishlist.removed';
    public const EVENT_CONTACT_SENT          = 'contact.sent';
    public const EVENT_CONTACT_MARKED_READ   = 'contact.marked_read';
    public const EVENT_CONTACT_DELETED       = 'contact.deleted';
    public const EVENT_REVIEW_SUBMITTED      = 'review.submitted';
    public const EVENT_REVIEW_APPROVED       = 'review.approved';
    public const EVENT_REVIEW_REJECTED       = 'review.rejected';
    public const EVENT_REVIEW_DELETED        = 'review.deleted';

    // ─── Attributs mass-assignables ────────────────────────────────────────────

    protected $fillable = [
        'user_id',
        'event_type',
        'category',
        'resource',
        'resource_id',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    // ─── Casts ─────────────────────────────────────────────────────────────────

    protected $casts = [
        'metadata' => 'array',
    ];

    // ─── Relations ─────────────────────────────────────────────────────────────

    /**
     * L'utilisateur lié à l'activité (nullable pour les actions de visiteurs).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
