<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PerformanceCacheManager
{
    /**
     * Obtenir une valeur depuis le cache ou la calculer si absente.
     *
     * @param  string   $key
     * @param  int      $ttl
     * @param  callable $callback
     * @param  array    $tags
     * @return mixed
     */
    public static function remember(string $key, int $ttl, callable $callback, array $tags = []): mixed
    {
        if (!config('cache-performance.enabled', true)) {
            return $callback();
        }

        try {
            if (!empty($tags) && static::supportsTags()) {
                return Cache::tags($tags)->remember($key, $ttl, $callback);
            }

            return Cache::remember($key, $ttl, $callback);
        } catch (\Throwable $e) {
            Log::warning("PerformanceCacheManager remember failed for key {$key}: " . $e->getMessage());
            return $callback();
        }
    }

    /**
     * Supprimer une clé ou une liste de clés du cache.
     *
     * @param  string|array $keys
     * @param  array        $tags
     * @return bool
     */
    public static function forget(string|array $keys, array $tags = []): bool
    {
        try {
            if (!empty($tags) && static::supportsTags()) {
                Cache::tags($tags)->flush();
            }

            $keysArray = is_array($keys) ? $keys : [$keys];
            foreach ($keysArray as $key) {
                Cache::forget($key);
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning("PerformanceCacheManager forget failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Effacer tout le cache de performance.
     *
     * @return void
     */
    public static function clearAll(): void
    {
        $tags = ['products', 'categories', 'filters', 'popular', 'similar', 'dashboard', 'settings', 'stats', 'search'];

        if (static::supportsTags()) {
            try {
                Cache::tags($tags)->flush();
            } catch (\Throwable $e) {
                Cache::flush();
            }
        } else {
            Cache::flush();
        }
    }

    /**
     * Invalider le cache lié aux produits.
     */
    public static function invalidateProducts(): void
    {
        static::forget([
            'products_filters_data',
            'popular_products_list',
            'dashboard_metrics',
            'dashboard_sales_chart',
            'dashboard_popular_products',
        ], ['products', 'filters', 'popular', 'dashboard', 'similar']);
    }

    /**
     * Invalider le cache lié aux catégories.
     */
    public static function invalidateCategories(): void
    {
        static::forget([
            'categories_all',
            'products_filters_data',
            'dashboard_metrics',
        ], ['categories', 'filters', 'dashboard']);
    }

    /**
     * Invalider le cache lié au tableau de bord et commandes.
     */
    public static function invalidateDashboard(): void
    {
        static::forget([
            'dashboard_metrics',
            'dashboard_sales_chart_15',
            'dashboard_popular_products_5',
            'dashboard_latest_orders_5',
            'dashboard_latest_messages_5',
            'popular_products_list_8',
            'popular_products_list_4',
        ], ['dashboard', 'popular', 'stats']);
    }

    /**
     * Invalider le cache des avis.
     */
    public static function invalidateReviews(): void
    {
        static::forget([
            'reviews_approved_list_20',
            'reviews_approved_list_50',
            'reviews_approved_list_100',
            'popular_products_list_8',
            'popular_products_list_4',
            'dashboard_metrics',
        ], ['reviews', 'popular', 'dashboard']);
    }

    /**
     * Invalider le cache des messages contact.
     */
    public static function invalidateContacts(): void
    {
        static::forget([
            'dashboard_metrics',
            'dashboard_latest_messages_5',
            'dashboard_latest_messages_10',
        ], ['contacts', 'dashboard']);
    }

    /**
     * Invalider le cache des paramètres.
     */
    public static function invalidateSettings(): void
    {
        static::forget([
            'public_settings_all',
        ], ['settings']);
    }

    /**
     * Vérifier si le driver de cache supporte les tags.
     *
     * @return bool
     */
    public static function supportsTags(): bool
    {
        $driver = config('cache.default');
        return in_array($driver, ['redis', 'memcached', 'octane']);
    }
}
