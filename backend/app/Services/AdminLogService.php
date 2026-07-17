<?php

namespace App\Services;

use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Service centralisé de journalisation des actions administrateur.
 *
 * Usage dans un contrôleur :
 *
 *   $this->adminLogService->log(
 *       request: $request,
 *       action: AdminLog::ACTION_CREATE,
 *       resource: AdminLog::RESOURCE_PRODUCT,
 *       resourceId: $product->id,
 *       newValues: ['name' => $product->name, 'price' => $product->price],
 *   );
 */
class AdminLogService
{
    /**
     * Enregistrer une action administrateur.
     *
     * @param  Request        $request     Requête HTTP courante (pour IP & User-Agent).
     * @param  string         $action      Type d'action (constante AdminLog::ACTION_*).
     * @param  string         $resource    Ressource concernée (constante AdminLog::RESOURCE_*).
     * @param  int|null       $resourceId  Identifiant de la ressource concernée.
     * @param  array|null     $oldValues   Valeurs avant modification.
     * @param  array|null     $newValues   Valeurs après modification.
     */
    public function log(
        Request  $request,
        string   $action,
        string   $resource,
        ?int     $resourceId = null,
        ?array   $oldValues  = null,
        ?array   $newValues  = null,
    ): void {
        try {
            AdminLog::create([
                'admin_id'    => $request->user()?->id,
                'action'      => $action,
                'resource'    => $resource,
                'resource_id' => $resourceId,
                'old_values'  => $oldValues,
                'new_values'  => $newValues,
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // La journalisation ne doit jamais interrompre le flux métier.
            Log::error('AdminLogService: échec de la journalisation.', [
                'action'    => $action,
                'resource'  => $resource,
                'exception' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Extraire les valeurs auditables d'un tableau de données validées.
     * Supprime les champs non pertinents (fichiers, tokens…).
     *
     * @param  array    $data          Données validées.
     * @param  array    $excludeKeys   Clés à exclure explicitement.
     * @return array
     */
    public function sanitize(array $data, array $excludeKeys = []): array
    {
        $defaultExcluded = ['_method', 'password', 'password_confirmation', 'token'];
        $excluded        = array_merge($defaultExcluded, $excludeKeys);

        return array_diff_key($data, array_flip($excluded));
    }

    /**
     * Extraire les champs scalaires auditables d'un modèle Eloquent.
     * Ignore les attributs sensibles et les relations.
     *
     * @param  \Illuminate\Database\Eloquent\Model $model
     * @param  array                               $only   Si fourni, ne conserver que ces clés.
     * @return array
     */
    public function extractModelValues(\Illuminate\Database\Eloquent\Model $model, array $only = []): array
    {
        $hidden    = $model->getHidden();
        $attributes = $model->getAttributes();

        // Supprimer les attributs cachés (password, remember_token…)
        $attributes = array_diff_key($attributes, array_flip($hidden));

        if (!empty($only)) {
            $attributes = array_intersect_key($attributes, array_flip($only));
        }

        return $attributes;
    }
}
