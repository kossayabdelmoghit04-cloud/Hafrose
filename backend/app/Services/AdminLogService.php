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
 *       request:     $request,
 *       action:      AdminLog::ACTION_CREATE,
 *       resource:    AdminLog::RESOURCE_PRODUCT,
 *       resourceId:  $product->id,
 *       description: 'Création du produit Luxe Chrono',
 *       newValues:   ['name' => $product->name, 'price' => $product->price],
 *   );
 */
class AdminLogService
{
    /**
     * Enregistrer une action administrateur.
     *
     * @param  Request        $request     Requête HTTP courante (pour IP, User-Agent, URL, Méthode).
     * @param  string         $action      Type d'action (constante AdminLog::ACTION_*).
     * @param  string         $resource    Ressource concernée (constante AdminLog::RESOURCE_*).
     * @param  int|null       $resourceId  Identifiant de la ressource concernée.
     * @param  array|null     $oldValues   Valeurs avant modification.
     * @param  array|null     $newValues   Valeurs après modification.
     * @param  string|null    $description Résumé lisible de l'action.
     */
    public function log(
        Request  $request,
        string   $action,
        string   $resource,
        ?int     $resourceId  = null,
        ?array   $oldValues   = null,
        ?array   $newValues   = null,
        ?string  $description = null,
    ): void {
        try {
            $sanitizedOld = $oldValues ? $this->sanitize($oldValues) : null;
            $sanitizedNew = $newValues ? $this->sanitize($newValues) : null;

            $generatedDescription = $description ?? $this->generateDescription($action, $resource, $resourceId);

            AdminLog::create([
                'admin_id'    => $request->user()?->id,
                'action'      => $action,
                'resource'    => $resource,
                'resource_id' => $resourceId,
                'description' => $generatedDescription,
                'old_values'  => $sanitizedOld,
                'new_values'  => $sanitizedNew,
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
                'url'         => substr($request->fullUrl(), 0, 500),
                'method'      => strtoupper($request->method()),
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
     * Générer une description automatique par défaut si aucune n'est fournie.
     */
    public function generateDescription(string $action, string $resource, ?int $resourceId = null): string
    {
        $resourceName = ucfirst($resource);
        $target = $resourceId ? " #{$resourceId}" : "";

        return match ($action) {
            AdminLog::ACTION_LOGIN         => "Connexion administrateur",
            AdminLog::ACTION_LOGOUT        => "Déconnexion administrateur",
            AdminLog::ACTION_CREATE        => "Création de {$resourceName}{$target}",
            AdminLog::ACTION_UPDATE        => "Modification de {$resourceName}{$target}",
            AdminLog::ACTION_DELETE        => "Suppression de {$resourceName}{$target}",
            AdminLog::ACTION_STATUS_CHANGE => "Changement de statut de {$resourceName}{$target}",
            AdminLog::ACTION_APPROVE       => "Approbation de {$resourceName}{$target}",
            AdminLog::ACTION_REJECT        => "Rejet de {$resourceName}{$target}",
            AdminLog::ACTION_MARK_READ     => "Marquage comme lu de {$resourceName}{$target}",
            AdminLog::ACTION_UPLOAD        => "Téléversement pour {$resourceName}{$target}",
            AdminLog::ACTION_EXPORT        => "Exportation de {$resourceName}{$target}",
            AdminLog::ACTION_ACTIVATE       => "Activation de {$resourceName}{$target}",
            AdminLog::ACTION_DEACTIVATE     => "Désactivation de {$resourceName}{$target}",
            AdminLog::ACTION_PUBLISH        => "Publication de {$resourceName}{$target}",
            AdminLog::ACTION_UNPUBLISH      => "Dépublication de {$resourceName}{$target}",
            AdminLog::ACTION_ARCHIVE        => "Archivage de {$resourceName}{$target}",
            AdminLog::ACTION_BULK_DELETE    => "Suppression groupée de {$resourceName}s",
            AdminLog::ACTION_BULK_UPDATE    => "Mise à jour groupée de {$resourceName}s",
            default                        => "Action {$action} sur {$resourceName}{$target}",
        };
    }

    /**
     * Extraire les valeurs auditables d'un tableau de données.
     * Supprime impérativement les champs sensibles (mots de passe, tokens, secrets…).
     *
     * @param  array    $data          Données à filtrer.
     * @param  array    $excludeKeys   Clés supplémentaires à exclure.
     * @return array
     */
    public function sanitize(array $data, array $excludeKeys = []): array
    {
        $sensitiveKeys = [
            '_method',
            'password',
            'password_confirmation',
            'token',
            'secret',
            'secret_key',
            'api_key',
            'access_token',
            'refresh_token',
            'credit_card',
            'card_number',
            'cvv',
        ];

        $excluded = array_merge($sensitiveKeys, $excludeKeys);

        $filtered = array_diff_key($data, array_flip($excluded));

        // Filtrer récursivement les sous-tableaux le cas échéant
        foreach ($filtered as $key => $value) {
            if (is_array($value)) {
                $filtered[$key] = $this->sanitize($value, $excludeKeys);
            }
        }

        return $filtered;
    }

    /**
     * Extraire les champs scalaires auditables d'un modèle Eloquent.
     * Ignore les attributs sensibles et cachés.
     *
     * @param  \Illuminate\Database\Eloquent\Model $model
     * @param  array                               $only   Si fourni, ne conserver que ces clés.
     * @return array
     */
    public function extractModelValues(\Illuminate\Database\Eloquent\Model $model, array $only = []): array
    {
        $hidden     = $model->getHidden();
        $attributes = $model->getAttributes();

        // Supprimer les attributs cachés
        $attributes = array_diff_key($attributes, array_flip($hidden));

        // Exclure automatiquement les champs sensibles connus
        $attributes = $this->sanitize($attributes);

        if (!empty($only)) {
            $attributes = array_intersect_key($attributes, array_flip($only));
        }

        return $attributes;
    }
}
