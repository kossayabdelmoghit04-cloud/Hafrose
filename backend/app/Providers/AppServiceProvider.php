<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Rate Limiters définis :
     *
     * - api           : Routes publiques générales (catégories, produits, avis lecture, recommandations)
     *                   60 req/min par utilisateur connecté ou par IP.
     *
     * - contact       : Formulaire de contact public. Anti-spam strict.
     *                   5 req/min par IP.
     *
     * - reviews       : Soumission d'avis publique. Limite l'abus sans bloquer la navigation.
     *                   10 req/min par IP.
     *
     * - orders        : Passage de commande. Protège contre le scripting et le flood.
     *                   20 req/min par IP (les clients légitimes commandent rarement en rafale).
     *
     * - wishlist      : Actions wishlist (ajout/suppression). Limité par utilisateur connecté.
     *                   30 req/min par user_id (protège tout en restant confortable).
     *
     * - admin-login   : Authentification admin. Anti-brute-force strict.
     *                   5 req/min par IP — indépendant du rate limiter général.
     */
    public function boot(): void
    {
        // ── Routes publiques générales ─────────────────────────────────────────
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip());
        });

        // ── Formulaire de contact ──────────────────────────────────────────────
        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip());
        });

        // ── Soumission d'avis ──────────────────────────────────────────────────
        RateLimiter::for('reviews', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip());
        });

        // ── Passage de commande ────────────────────────────────────────────────
        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinute(20)
                ->by($request->ip());
        });

        // ── Wishlist (actions authentifiées) ───────────────────────────────────
        RateLimiter::for('wishlist', function (Request $request) {
            return Limit::perMinute(30)
                ->by($request->user()?->id ?: $request->ip());
        });

        // ── Authentification admin (anti-brute-force) ──────────────────────────
        RateLimiter::for('admin-login', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip());
        });
    }
}
