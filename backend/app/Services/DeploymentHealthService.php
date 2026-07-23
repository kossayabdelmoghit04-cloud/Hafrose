<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

/**
 * Service de vérification et d'audit de santé de l'environnement de production HAFROSE.
 *
 * Responsabilités :
 *   - Vérification des permissions d'écriture (storage, bootstrap/cache)
 *   - État des caches compilés (config, route, view, event)
 *   - Configuration queue & scheduler
 *   - État de l'extension OPcache
 *   - Compatibilité de la version PHP (>= 8.3)
 *   - Vérification des extensions PHP indispensables
 *   - Audit des permissions système
 */
class DeploymentHealthService
{
    /**
     * Exécuter l'ensemble des vérifications de déploiement et de production.
     *
     * @return array{
     *     overall_status: string,
     *     checks: array<string, array{status: string, message: string, recommendation: string}>,
     *     summary: array{total: int, ok: int, warning: int, error: int}
     * }
     */
    public function checkAll(): array
    {
        $checks = [
            'storage_writable' => $this->checkStorageWritable(),
            'bootstrap_cache_writable' => $this->checkBootstrapCacheWritable(),
            'config_cache' => $this->checkConfigCache(),
            'route_cache' => $this->checkRouteCache(),
            'view_cache' => $this->checkViewCache(),
            'event_cache' => $this->checkEventCache(),
            'queue_config' => $this->checkQueueConfig(),
            'scheduler_config' => $this->checkSchedulerConfig(),
            'opcache_status' => $this->checkOpcacheStatus(),
            'php_version' => $this->checkPhpVersion(),
            'required_extensions' => $this->checkRequiredExtensions(),
            'permissions' => $this->checkPermissions(),
        ];

        $okCount = 0;
        $warningCount = 0;
        $errorCount = 0;

        foreach ($checks as $check) {
            match ($check['status']) {
                'ok' => $okCount++,
                'warning' => $warningCount++,
                'error' => $errorCount++,
                default => null,
            };
        }

        $overallStatus = 'ok';
        if ($errorCount > 0) {
            $overallStatus = 'error';
        } elseif ($warningCount > 0) {
            $overallStatus = 'warning';
        }

        return [
            'overall_status' => $overallStatus,
            'checks' => $checks,
            'summary' => [
                'total' => count($checks),
                'ok' => $okCount,
                'warning' => $warningCount,
                'error' => $errorCount,
            ],
        ];
    }

    /**
     * 1. Vérification de l'inscriptibilité du dossier storage.
     */
    public function checkStorageWritable(): array
    {
        $path = storage_path();
        $isWritable = is_dir($path) && is_writable($path);

        return [
            'status' => $isWritable ? 'ok' : 'error',
            'message' => $isWritable
                ? "Le répertoire storage ({$path}) est accessible en écriture."
                : "Le répertoire storage ({$path}) n'est pas inscriptible.",
            'recommendation' => $isWritable
                ? 'Aucune action requise.'
                : "Exécuter 'chmod -R 775 storage' et vérifier le propriétaire (chown -R www-data:www-data storage).",
        ];
    }

    /**
     * 2. Vérification de l'inscriptibilité du dossier bootstrap/cache.
     */
    public function checkBootstrapCacheWritable(): array
    {
        $path = base_path('bootstrap/cache');
        $isWritable = is_dir($path) && is_writable($path);

        return [
            'status' => $isWritable ? 'ok' : 'error',
            'message' => $isWritable
                ? "Le répertoire bootstrap/cache ({$path}) est accessible en écriture."
                : "Le répertoire bootstrap/cache ({$path}) n'est pas inscriptible.",
            'recommendation' => $isWritable
                ? 'Aucune action requise.'
                : "Exécuter 'chmod -R 775 bootstrap/cache' et ajuster les droits de l'utilisateur web.",
        ];
    }

    /**
     * 3. Vérification du cache de configuration.
     */
    public function checkConfigCache(): array
    {
        $isCached = app()->configurationIsCached();

        return [
            'status' => $isCached ? 'ok' : 'warning',
            'message' => $isCached
                ? 'La configuration est mise en cache pour la production.'
                : "La configuration n'est pas mise en cache.",
            'recommendation' => $isCached
                ? 'Aucune action requise.'
                : "Exécuter 'php artisan config:cache' pour optimiser les temps de réponse.",
        ];
    }

    /**
     * 4. Vérification du cache des routes.
     */
    public function checkRouteCache(): array
    {
        $isCached = app()->routesAreCached();

        return [
            'status' => $isCached ? 'ok' : 'warning',
            'message' => $isCached
                ? 'Les routes applicatives sont mises en cache.'
                : 'Les routes ne sont pas mises en cache.',
            'recommendation' => $isCached
                ? 'Aucune action requise.'
                : "Exécuter 'php artisan route:cache' pour des performances réseau maximales.",
        ];
    }

    /**
     * 5. Vérification du cache des vues.
     */
    public function checkViewCache(): array
    {
        $compiledPath = storage_path('framework/views');
        $hasCompiled = is_dir($compiledPath) && count(File::files($compiledPath)) > 0;

        return [
            'status' => $hasCompiled ? 'ok' : 'warning',
            'message' => $hasCompiled
                ? 'Les vues Blade sont précompilées en cache.'
                : 'Aucune vue précompilée détectée dans storage/framework/views.',
            'recommendation' => $hasCompiled
                ? 'Aucune action requise.'
                : "Exécuter 'php artisan view:cache' pour précompiler les vues Blade.",
        ];
    }

    /**
     * 6. Vérification du cache des événements.
     */
    public function checkEventCache(): array
    {
        $isCached = app()->eventsAreCached();

        return [
            'status' => $isCached ? 'ok' : 'warning',
            'message' => $isCached
                ? 'Le mapping des événements et écouteurs est en cache.'
                : "Le mapping des événements n'est pas mis en cache.",
            'recommendation' => $isCached
                ? 'Aucune action requise.'
                : "Exécuter 'php artisan event:cache' pour accélérer la découverte des événements.",
        ];
    }

    /**
     * 7. Vérification de la configuration de file d'attente (Queue).
     */
    public function checkQueueConfig(): array
    {
        $connection = config('queue.default');
        $isSync = ($connection === 'sync');

        return [
            'status' => $isSync ? 'warning' : 'ok',
            'message' => "Pilote de file d'attente configuré : '{$connection}'.",
            'recommendation' => $isSync
                ? "En environnement de production, utiliser 'redis' ou 'database' au lieu de 'sync' avec Supervisor."
                : 'Conserver le gestionnaire de worker Supervisor actif.',
        ];
    }

    /**
     * 8. Vérification du planificateur de tâches (Scheduler).
     */
    public function checkSchedulerConfig(): array
    {
        $enabled = config('deployment.scheduler.enabled', true);

        return [
            'status' => $enabled ? 'ok' : 'warning',
            'message' => $enabled
                ? 'Le planificateur de tâches est activé dans la configuration.'
                : 'Le planificateur de tâches est désactivé dans la configuration.',
            'recommendation' => $enabled
                ? "S'assurer que la tâche cron '* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1' est configurée."
                : 'Activer SCHEDULER_ENABLED=true dans le fichier .env.',
        ];
    }

    /**
     * 9. Vérification du statut d'OPcache.
     */
    public function checkOpcacheStatus(): array
    {
        $opcacheEnabled = function_exists('opcache_get_status') && ! empty(opcache_get_status(false));

        return [
            'status' => $opcacheEnabled ? 'ok' : 'warning',
            'message' => $opcacheEnabled
                ? 'OPcache PHP est actif et opérationnel.'
                : "OPcache PHP n'est pas actif ou non configuré.",
            'recommendation' => $opcacheEnabled
                ? 'Aucune action requise.'
                : "Activer opcache.enable=1 dans php.ini en production pour des gains significatifs de vitesse d'exécution.",
        ];
    }

    /**
     * 10. Vérification de la version de PHP.
     */
    public function checkPhpVersion(): array
    {
        $currentVersion = PHP_VERSION;
        $minVersion = config('deployment.php.min_version', '8.3.0');
        $isCompatible = version_compare($currentVersion, $minVersion, '>=');

        return [
            'status' => $isCompatible ? 'ok' : 'error',
            'message' => "Version PHP installée : {$currentVersion} (Requise : >= {$minVersion}).",
            'recommendation' => $isCompatible
                ? 'Aucune action requise.'
                : "Mettre à jour la version de PHP vers version >= {$minVersion}.",
        ];
    }

    /**
     * 11. Vérification des extensions PHP obligatoires.
     */
    public function checkRequiredExtensions(): array
    {
        $required = [
            'pdo',
            'mbstring',
            'openssl',
            'ctype',
            'json',
            'tokenizer',
            'xml',
            'curl',
            'zip',
            'bcmath',
            'gd',
        ];

        $missing = [];
        foreach ($required as $ext) {
            if (! extension_loaded($ext)) {
                $missing[] = $ext;
            }
        }

        $isOk = empty($missing);

        return [
            'status' => $isOk ? 'ok' : 'error',
            'message' => $isOk
                ? 'Toutes les extensions PHP requises sont chargées ('.implode(', ', $required).').'
                : 'Extensions PHP manquantes : '.implode(', ', $missing),
            'recommendation' => $isOk
                ? 'Aucune action requise.'
                : 'Installer les extensions manquantes via apt-get / yum (ex: php8.3-zip php8.3-gd).',
        ];
    }

    /**
     * 12. Vérification des permissions sur les répertoires critiques.
     */
    public function checkPermissions(): array
    {
        $storageDir = storage_path();
        $cacheDir = base_path('bootstrap/cache');

        $storagePermsOk = is_readable($storageDir) && is_writable($storageDir);
        $cachePermsOk = is_readable($cacheDir) && is_writable($cacheDir);

        $isOk = $storagePermsOk && $cachePermsOk;

        return [
            'status' => $isOk ? 'ok' : 'error',
            'message' => $isOk
                ? 'Les répertoires de stockage et de cache possèdent les permissions de lecture/écriture requises.'
                : 'Accès restreint sur le système de fichiers (storage ou bootstrap/cache non accessibles).',
            'recommendation' => $isOk
                ? 'Aucune action requise.'
                : 'Accorder les privilèges de lecture/écriture au serveur Web (CHMOD 775 / CHOWN www-data).',
        ];
    }
}
