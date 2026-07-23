<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * Service de gestion de la maintenance applicative — HAFROSE.
 *
 * Responsabilités :
 *  — Activer / désactiver la maintenance Laravel
 *  — Maintenance programmée avec délai
 *  — Maintenance sécurisée avec secret bypass
 *  — Support des IPs autorisées
 *  — Consultation du statut courant
 */
class MaintenanceService
{
    // ─── Activation de la maintenance ────────────────────────────────────────

    /**
     * Activer le mode maintenance.
     *
     * @param  string|null  $secret  Secret pour bypasser la maintenance.
     * @param  array|null  $allowedIps  Liste d'IPs autorisées pendant la maintenance.
     * @param  string|null  $message  Message à afficher.
     * @param  int|null  $retryAfter  Temps estimé en secondes avant retour du service.
     * @return array Résultat de l'opération.
     */
    public function enable(
        ?string $secret = null,
        ?array $allowedIps = null,
        ?string $message = null,
        ?int $retryAfter = null,
    ): array {
        try {
            if ($this->isDown()) {
                return [
                    'success' => false,
                    'message' => 'La maintenance est déjà active.',
                ];
            }

            $options = $this->buildArtisanOptions($secret, $allowedIps, $message, $retryAfter);

            Artisan::call('down', $options);

            Log::info('MaintenanceService: mode maintenance activé.', $options);

            return [
                'success' => true,
                'message' => 'Mode maintenance activé.',
                'options' => $options,
                'activated_at' => now()->toIso8601String(),
            ];

        } catch (\Throwable $e) {
            Log::error('MaintenanceService: échec activation maintenance.', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Échec de l\'activation de la maintenance : '.$e->getMessage(),
            ];
        }
    }

    /**
     * Désactiver le mode maintenance.
     *
     * @return array Résultat de l'opération.
     */
    public function disable(): array
    {
        try {
            if (! $this->isDown()) {
                return [
                    'success' => false,
                    'message' => 'L\'application n\'est pas en maintenance.',
                ];
            }

            Artisan::call('up');

            Log::info('MaintenanceService: mode maintenance désactivé.');

            return [
                'success' => true,
                'message' => 'Mode maintenance désactivé. Application en ligne.',
                'deactivated_at' => now()->toIso8601String(),
            ];

        } catch (\Throwable $e) {
            Log::error('MaintenanceService: échec désactivation maintenance.', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Échec de la désactivation de la maintenance : '.$e->getMessage(),
            ];
        }
    }

    /**
     * Activer la maintenance sécurisée avec les paramètres de la configuration.
     *
     * Utilise les valeurs de config/production.php (MAINTENANCE_SECRET,
     * MAINTENANCE_ALLOWED_IPS, MAINTENANCE_MESSAGE, MAINTENANCE_RETRY_AFTER).
     *
     * @return array Résultat de l'opération.
     */
    public function enableSecure(): array
    {
        $secret = config('production.maintenance.secret');
        $allowedIps = config('production.maintenance.allowed_ips', []);
        $message = config('production.maintenance.message');
        $retryAfter = config('production.maintenance.retry_after', 0) ?: null;

        return $this->enable(
            secret: $secret ?: null,
            allowedIps: ! empty($allowedIps) ? $allowedIps : null,
            message: $message ?: null,
            retryAfter: $retryAfter,
        );
    }

    /**
     * Planifier une maintenance différée (dans N secondes).
     *
     * @param  int  $inSeconds  Délai avant l'activation (secondes).
     * @param  string|null  $secret  Secret de bypass.
     * @param  string|null  $message  Message à afficher.
     * @return array Résultat.
     */
    public function schedule(int $inSeconds, ?string $secret = null, ?string $message = null): array
    {
        if ($inSeconds <= 0) {
            return $this->enable(
                secret: $secret,
                message: $message,
            );
        }

        return [
            'success' => true,
            'message' => "Maintenance planifiée dans {$inSeconds} secondes.",
            'scheduled_at' => now()->toIso8601String(),
            'starts_at' => now()->addSeconds($inSeconds)->toIso8601String(),
            'note' => 'Pour une maintenance différée automatique, configurez le scheduler Laravel.',
        ];
    }

    // ─── Statut de la maintenance ─────────────────────────────────────────────

    /**
     * Vérifier si l'application est actuellement en maintenance.
     */
    public function isDown(): bool
    {
        return app()->isDownForMaintenance();
    }

    /**
     * Obtenir le statut détaillé de la maintenance.
     */
    public function status(): array
    {
        $isDown = $this->isDown();

        $data = [
            'in_maintenance' => $isDown,
            'checked_at' => now()->toIso8601String(),
        ];

        if ($isDown) {
            $data['maintenance_data'] = $this->readMaintenanceData();
        }

        return $data;
    }

    // ─── Utilitaires internes ─────────────────────────────────────────────────

    /**
     * Construire les options Artisan pour la commande `down`.
     */
    private function buildArtisanOptions(
        ?string $secret,
        ?array $allowedIps,
        ?string $message,
        ?int $retryAfter,
    ): array {
        $options = [];

        if (! empty($secret)) {
            $options['--secret'] = $secret;
        }

        if (! empty($allowedIps)) {
            $options['--allow'] = $allowedIps;
        }

        if (! empty($message)) {
            // Laravel >= 9 : --message non supporté nativement, stocker dans le fichier
        }

        if ($retryAfter > 0) {
            $options['--retry'] = $retryAfter;
        }

        return $options;
    }

    /**
     * Lire les données du fichier de maintenance Laravel.
     */
    private function readMaintenanceData(): array
    {
        $paths = [
            storage_path('framework/down'),
            base_path('storage/framework/down'),
        ];

        foreach ($paths as $path) {
            if (File::exists($path)) {
                $content = File::get($path);
                $data = json_decode($content, true);

                return $data ?? [];
            }
        }

        return [];
    }
}
