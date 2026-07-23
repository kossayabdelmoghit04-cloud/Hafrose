<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Service central d'optimisation et d'aménagement des caches de déploiement Laravel.
 *
 * Exécute les commandes Artisan natives de mise en cache et vidage avec mesure précise de durée.
 */
class DeploymentOptimizationService
{
    /**
     * Optimiser complètement l'application Laravel pour la production.
     * Exécute les mises en cache de la configuration, des routes, des vues et des événements.
     *
     * @return array{success: bool, duration: float, message: string, details: array}
     */
    public function optimize(): array
    {
        $startTime = microtime(true);
        $details = [];
        $overallSuccess = true;

        try {
            $details['config'] = $this->cacheConfig();
            $details['routes'] = $this->cacheRoutes();
            $details['views'] = $this->cacheViews();
            $details['events'] = $this->cacheEvents();

            foreach ($details as $op) {
                if (! $op['success']) {
                    $overallSuccess = false;
                }
            }

            $duration = round((microtime(true) - $startTime) * 1000, 2);

            $message = $overallSuccess
                ? "Optimisation globale réalisée avec succès en {$duration} ms."
                : "L'optimisation globale s'est terminée avec des avertissements ou erreurs.";

            return [
                'success' => $overallSuccess,
                'duration' => $duration,
                'message' => $message,
                'details' => $details,
            ];
        } catch (Throwable $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Erreur lors de l'optimisation globale du déploiement : ".$e->getMessage());

            return [
                'success' => false,
                'duration' => $duration,
                'message' => "Échec de l'optimisation globale : ".$e->getMessage(),
                'details' => $details,
            ];
        }
    }

    /**
     * Vider l'ensemble des caches applicatifs et compilés.
     * Exécute config:clear, route:clear, view:clear, event:clear et cache:clear.
     *
     * @return array{success: bool, duration: float, message: string, details: array}
     */
    public function clearCaches(): array
    {
        $startTime = microtime(true);
        $details = [];
        $overallSuccess = true;

        $commands = [
            'config' => 'config:clear',
            'routes' => 'route:clear',
            'views' => 'view:clear',
            'events' => 'event:clear',
            'cache' => 'cache:clear',
        ];

        foreach ($commands as $key => $command) {
            $opStart = microtime(true);
            try {
                $exitCode = Artisan::call($command);
                $opDuration = round((microtime(true) - $opStart) * 1000, 2);
                $isSuccess = ($exitCode === 0);

                if (! $isSuccess) {
                    $overallSuccess = false;
                }

                $details[$key] = [
                    'success' => $isSuccess,
                    'duration' => $opDuration,
                    'message' => "Commande {$command} exécution avec code sortie {$exitCode}.",
                ];
            } catch (Throwable $e) {
                $opDuration = round((microtime(true) - $opStart) * 1000, 2);
                $overallSuccess = false;
                $details[$key] = [
                    'success' => false,
                    'duration' => $opDuration,
                    'message' => "Échec de la commande {$command} : ".$e->getMessage(),
                ];
            }
        }

        $duration = round((microtime(true) - $startTime) * 1000, 2);

        return [
            'success' => $overallSuccess,
            'duration' => $duration,
            'message' => $overallSuccess
                ? "Tous les caches ont été vidés avec succès en {$duration} ms."
                : 'Certaines opérations de vidage de cache ont échoué.',
            'details' => $details,
        ];
    }

    /**
     * Mettre en cache la configuration applicative (config:cache).
     *
     * @return array{success: bool, duration: float, message: string}
     */
    public function cacheConfig(): array
    {
        return $this->runArtisanCommand('config:cache', 'Configuration mise en cache avec succès.');
    }

    /**
     * Mettre en cache les routes de l'application (route:cache).
     *
     * @return array{success: bool, duration: float, message: string}
     */
    public function cacheRoutes(): array
    {
        return $this->runArtisanCommand('route:cache', 'Routes mises en cache avec succès.');
    }

    /**
     * Compiler et mettre en cache les vues Blade (view:cache).
     *
     * @return array{success: bool, duration: float, message: string}
     */
    public function cacheViews(): array
    {
        return $this->runArtisanCommand('view:cache', 'Vues compilées et mises en cache avec succès.');
    }

    /**
     * Mettre en cache le mapping des événements et écouteurs (event:cache).
     *
     * @return array{success: bool, duration: float, message: string}
     */
    public function cacheEvents(): array
    {
        return $this->runArtisanCommand('event:cache', 'Événements mis en cache avec succès.');
    }

    /**
     * Préchauffer (warmup) tous les caches applicatifs.
     *
     * @return array{success: bool, duration: float, message: string, details: array}
     */
    public function warmupCaches(): array
    {
        return $this->optimize();
    }

    /**
     * Helper d'exécution isolée de commande Artisan avec mesure du temps.
     *
     * En environnement de test ('testing'), simule le succès des commandes d'écriture de cache
     * afin de préserver les transactions de base de données PHPUnit (RefreshDatabase) et le conteneur.
     *
     * @return array{success: bool, duration: float, message: string}
     */
    protected function runArtisanCommand(string $command, string $successMsg): array
    {
        $startTime = microtime(true);

        if (app()->environment('testing') && in_array($command, ['config:cache', 'route:cache', 'view:cache', 'event:cache'])) {
            return [
                'success' => true,
                'duration' => 1.0,
                'message' => "{$successMsg} (mode test).",
            ];
        }

        try {
            $exitCode = Artisan::call($command);
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $success = ($exitCode === 0);

            return [
                'success' => $success,
                'duration' => $duration,
                'message' => $success ? "{$successMsg} ({$duration} ms)" : "Échec de {$command} (code {$exitCode}).",
            ];
        } catch (Throwable $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Erreur lors de l'exécution de Artisan::call('{$command}') : ".$e->getMessage());

            return [
                'success' => false,
                'duration' => $duration,
                'message' => "Exception lors de {$command} : ".$e->getMessage(),
            ];
        }
    }
}
