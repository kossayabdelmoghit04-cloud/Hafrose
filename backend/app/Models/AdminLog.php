<?php

namespace App\Models;

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
 * @property array|null  $old_values
 * @property array|null  $new_values
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AdminLog extends Model
{
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

    // ─── Ressources disponibles ─────────────────────────────────────────────────

    public const RESOURCE_AUTH         = 'auth';
    public const RESOURCE_PRODUCT      = 'product';
    public const RESOURCE_CATEGORY     = 'category';
    public const RESOURCE_ORDER        = 'order';
    public const RESOURCE_REVIEW       = 'review';
    public const RESOURCE_CONTACT      = 'contact';
    public const RESOURCE_SETTING      = 'setting';
    public const RESOURCE_MEDIA        = 'media';

    // ─── Attributs mass-assignables ────────────────────────────────────────────

    protected $fillable = [
        'admin_id',
        'action',
        'resource',
        'resource_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    // ─── Casts ─────────────────────────────────────────────────────────────────

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    // ─── Relations ─────────────────────────────────────────────────────────────

    /**
     * L'administrateur ayant effectué l'action.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
