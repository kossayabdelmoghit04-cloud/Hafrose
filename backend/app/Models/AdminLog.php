<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modèle représentant un log d'action administrateur.
 *
 * @property int         $id
 * @property int|null    $admin_id
 * @property string      $action
 * @property string      $resource
 * @property int|null    $resource_id
 * @property string|null $description
 * @property array|null  $old_values
 * @property array|null  $new_values
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $url
 * @property string|null $method
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AdminLog extends Model
{
    use HasFactory;
    // ─── Actions disponibles ────────────────────────────────────────────────────

    public const ACTION_LOGIN          = 'login';
    public const ACTION_LOGOUT         = 'logout';
    public const ACTION_CREATE         = 'create';
    public const ACTION_UPDATE         = 'update';
    public const ACTION_DELETE         = 'delete';
    public const ACTION_STATUS_CHANGE  = 'status_change';
    public const ACTION_APPROVE        = 'approve';
    public const ACTION_REJECT         = 'reject';
    public const ACTION_MARK_READ      = 'mark_read';
    public const ACTION_UPLOAD         = 'upload';
    public const ACTION_EXPORT         = 'export';
    public const ACTION_BULK_DELETE    = 'bulk_delete';
    public const ACTION_BULK_UPDATE    = 'bulk_update';
    public const ACTION_ACTIVATE       = 'activate';
    public const ACTION_DEACTIVATE     = 'deactivate';
    public const ACTION_PUBLISH        = 'publish';
    public const ACTION_UNPUBLISH      = 'unpublish';
    public const ACTION_ARCHIVE        = 'archive';

    // ─── Ressources disponibles ─────────────────────────────────────────────────

    public const RESOURCE_AUTH         = 'auth';
    public const RESOURCE_PRODUCT      = 'product';
    public const RESOURCE_CATEGORY     = 'category';
    public const RESOURCE_ORDER        = 'order';
    public const RESOURCE_REVIEW       = 'review';
    public const RESOURCE_CONTACT      = 'contact';
    public const RESOURCE_SETTING      = 'setting';
    public const RESOURCE_MEDIA        = 'media';
    public const RESOURCE_USER         = 'user';

    // ─── Attributs mass-assignables ────────────────────────────────────────────

    protected $fillable = [
        'admin_id',
        'action',
        'resource',
        'resource_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'url',
        'method',
    ];

    // ─── Casts ─────────────────────────────────────────────────────────────────

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    // ─── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Accessor pour alias `resource_type` correspondant à `resource`.
     */
    public function getResourceTypeAttribute(): string
    {
        return $this->attributes['resource'] ?? '';
    }

    // ─── Relations ─────────────────────────────────────────────────────────────

    /**
     * L'administrateur ayant effectué l'action.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
