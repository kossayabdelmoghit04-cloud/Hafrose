<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;

/**
 * Service centralisé de journalisation de l'activité globale.
 */
class ActivityLogService
{
    /**
     * Enregistrer une activité dans le journal global.
     *
     * @param  string      $eventType  Type d'événement (ActivityLog::EVENT_*)
     * @param  string      $category   Catégorie d'événement (ActivityLog::CATEGORY_*)
     * @param  string|null $resource   Nom de la ressource concernée
     * @param  int|null    $resourceId Identifiant de la ressource concernée
     * @param  array|null  $metadata   Métadonnées additionnelles
     * @param  int|null    $userId     Identifiant explicite de l'utilisateur (optionnel, résolu via auth() par défaut)
     */
    public function log(
        string  $eventType,
        string  $category,
        ?string $resource = null,
        ?int    $resourceId = null,
        ?array  $metadata = null,
        ?int    $userId = null
    ): void {
        try {
            $request = request();
            $ipAddress = $request ? $request->ip() : null;
            $userAgent = $request ? $request->userAgent() : null;

            // Résoudre l'utilisateur connecté si non passé explicitement
            $resolvedUserId = $userId ?? auth()->id();

            // Sécuriser les métadonnées contre l'enregistrement d'informations sensibles
            if ($metadata) {
                $metadata = $this->sanitizeMetadata($metadata);
            }

            ActivityLog::create([
                'user_id'     => $resolvedUserId,
                'event_type'  => $eventType,
                'category'    => $category,
                'resource'    => $resource,
                'resource_id' => $resourceId,
                'ip_address'  => $ipAddress,
                'user_agent'  => $userAgent,
                'metadata'    => $metadata,
            ]);
        } catch (\Throwable $e) {
            // L'échec du log d'activité ne doit jamais bloquer le déroulement de l'application
            Log::error('ActivityLogService: échec de l\'enregistrement de l\'activité.', [
                'event_type' => $eventType,
                'category'   => $category,
                'exception'  => $e->getMessage(),
            ]);
        }
    }

    /**
     * Exclure préventivement les clés sensibles des métadonnées.
     */
    private function sanitizeMetadata(array $metadata): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'access_token', 'card_number', 'cvv'];

        foreach ($sensitiveKeys as $key) {
            if (array_key_exists($key, $metadata)) {
                unset($metadata[$key]);
            }
        }

        return $metadata;
    }
}
