<?php

use App\Http\Controllers\Api\Admin\ActivityLogController;
use App\Http\Controllers\Api\Admin\AdminLogController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\BulkActionController;
use App\Http\Controllers\Api\Admin\CacheAdminController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DeploymentController;
use App\Http\Controllers\Api\Admin\ExportController;
use App\Http\Controllers\Api\Admin\HistoryController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\SettingController;
use App\Http\Controllers\Api\Admin\SystemBackupController;
use App\Http\Controllers\Api\Admin\SystemMonitoringController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route par défaut de Laravel Sanctum (préservée)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ── Wishlist (authentifiée, budget dédié anti-flood) ──────────────────────────
// throttle:wishlist  → 30 req/min par user_id
Route::middleware(['auth:sanctum', 'throttle:wishlist'])->group(function () {
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{product}', [WishlistController::class, 'check']);
});

// ── Routes publiques générales (catégories, produits, recommandations) ─────────
// throttle:api  → 60 req/min par user_id ou IP
Route::middleware('throttle:api')->group(function () {
    // Catégories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Produits (lecture seule)
    Route::get('/products/filters', [ProductController::class, 'filters']);
    Route::get('/products/popular', [ProductController::class, 'popular']);
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products/autocomplete', [\App\Http\Controllers\Api\SearchController::class, 'autocomplete']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/{product}/related', [ProductController::class, 'related']);
    Route::get('/products/{product}/similar', [ProductController::class, 'similar']);

    // Avis (lecture seule)
    Route::get('/reviews', [ReviewController::class, 'index']);
});

// ── Soumission d'avis (budget dédié, protège contre le spam de notation) ───────
// throttle:reviews  → 10 req/min par IP
Route::post('/reviews', [ReviewController::class, 'store'])
    ->middleware(['throttle:reviews', 'honeypot', 'turnstile']);

// ── Passage de commande (budget dédié, protège contre le scripting) ────────────
// throttle:orders  → 20 req/min par IP
Route::post('/orders', [OrderController::class, 'store'])
    ->middleware(['throttle:orders', 'honeypot', 'turnstile']);

// ── Formulaire de contact (budget strict anti-spam) ───────────────────────────
// throttle:contact  → 5 req/min par IP
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware(['throttle:contact', 'honeypot', 'turnstile']);

// ── ROUTES BACK OFFICE ADMINISTRATEUR ────────────────────────────────────────
Route::prefix('admin')->group(function () {

    // Authentification admin : anti-brute-force dédié
    // throttle:admin-login  → 5 req/min par IP
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:admin-login');

    // Routes admin protégées (auth:sanctum + rôle admin) ─ pas de throttle supplémentaire
    // car l'accès est déjà doublement restreint (token Sanctum + middleware admin).
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Profil
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Exports CSV & Excel
        Route::get('/export/{resource}/csv', [ExportController::class, 'exportCsv']);
        Route::get('/export/{resource}/excel', [ExportController::class, 'exportExcel']);

        // Actions groupées (Bulk Actions) — Doit être déclaré avant /{resource}/{id} pour éviter les conflits
        Route::post('/{resource}/bulk', [BulkActionController::class, 'bulk'])
            ->where('resource', 'products|categories|reviews|contacts|orders');

        // Historique des modifications
        Route::get('/history/{resource}/{id}', [HistoryController::class, 'show']);

        // Catégories CRUD (POST utilisé pour la mise à jour afin de gérer facilement multipart/form-data)
        Route::get('/categories', [App\Http\Controllers\Api\Admin\CategoryController::class, 'index']);
        Route::post('/categories', [App\Http\Controllers\Api\Admin\CategoryController::class, 'store']);
        Route::post('/categories/{category}', [App\Http\Controllers\Api\Admin\CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy']);

        // Produits CRUD (POST utilisé pour la mise à jour pour gérer l'upload multiple et spoofing de formulaire)
        Route::get('/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
        Route::post('/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
        Route::post('/products/{product}', [App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
        Route::delete('/products/{product}', [App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);

        // Commandes
        Route::get('/orders', [App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
        Route::get('/orders/{order}', [App\Http\Controllers\Api\Admin\OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus']);
        Route::get('/orders/{order}/pdf', [App\Http\Controllers\Api\Admin\OrderController::class, 'exportPdf']);

        // Avis
        Route::get('/reviews', [App\Http\Controllers\Api\Admin\ReviewController::class, 'index']);
        Route::patch('/reviews/{review}/approve', [App\Http\Controllers\Api\Admin\ReviewController::class, 'approve']);
        Route::patch('/reviews/{review}/reject', [App\Http\Controllers\Api\Admin\ReviewController::class, 'reject']);
        Route::delete('/reviews/{review}', [App\Http\Controllers\Api\Admin\ReviewController::class, 'destroy']);

        // Contacts (Messages)
        Route::get('/contacts', [App\Http\Controllers\Api\Admin\ContactController::class, 'index']);
        Route::patch('/contacts/{contact}/read', [App\Http\Controllers\Api\Admin\ContactController::class, 'markAsRead']);
        Route::delete('/contacts/{contact}', [App\Http\Controllers\Api\Admin\ContactController::class, 'destroy']);

        // Paramètres du site
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);

        // Médiathèque
        Route::get('/media', [MediaController::class, 'index']);
        Route::post('/media', [MediaController::class, 'store']);
        Route::delete('/media/{media}', [MediaController::class, 'destroy']);

        // Journal d'administration (Consultation seule, immuable)
        Route::get('/logs', [AdminLogController::class, 'index']);
        Route::get('/logs/{log}', [AdminLogController::class, 'show']);

        // Journal d'activité global (Consultation seule, immuable)
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/{log}', [ActivityLogController::class, 'show']);

        // ── Cache Performance Management ──────────────────────────────────────
        Route::post('/cache/clear', [CacheAdminController::class, 'clear']);
        Route::post('/cache/dashboard/refresh', [CacheAdminController::class, 'refreshDashboard']);
        Route::get('/cache/status', [CacheAdminController::class, 'status']);

        // ── Sauvegardes système (Phase 5.8.1) ────────────────────────────────
        Route::post('/system/backup', [SystemBackupController::class, 'create']);
        Route::get('/system/backups', [SystemBackupController::class, 'index']);
        Route::delete('/system/backups/{id}', [SystemBackupController::class, 'destroy']);

        // ── Monitoring & Observabilité (Phase 5.9) ───────────────────────────
        Route::get('/system/health', [SystemMonitoringController::class, 'health']);
        Route::get('/system/metrics', [SystemMonitoringController::class, 'metrics']);
        Route::get('/system/status', [SystemMonitoringController::class, 'status']);
        Route::get('/system/phpinfo', [SystemMonitoringController::class, 'phpinfo']);

        // ── Infrastructure de Déploiement & Optimisation (Phase 5.8.2.1) ─────
        Route::get('/system/deployment/status', [DeploymentController::class, 'status']);
        Route::post('/system/deployment/optimize', [DeploymentController::class, 'optimize']);
        Route::post('/system/deployment/clear', [DeploymentController::class, 'clear']);
        Route::post('/system/deployment/warmup', [DeploymentController::class, 'warmup']);

        // ── v2.0 Enterprise Analytics ───────────────────────────────────────
        Route::get('/analytics/dashboard', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'index']);
    });
});

// ── HAFROSE E-COMMERCE LUXE EXPANSION ROUTES ──────────────────────────────
Route::middleware('throttle:api')->group(function () {
    // Phase 6.4: Gift Cards Check
    Route::get('/gift-cards/check', [\App\Http\Controllers\Api\GiftCardController::class, 'check']);

    // Phase 6.5: Multi-Currency
    Route::get('/currencies', [\App\Http\Controllers\Api\CurrencyController::class, 'index']);
});

// Authenticated v2 Routes
Route::middleware('auth:sanctum')->group(function () {
    // Phase 6.3: Loyalty Program
    Route::get('/loyalty/account', [\App\Http\Controllers\Api\LoyaltyController::class, 'account']);
    Route::get('/loyalty/rewards', [\App\Http\Controllers\Api\LoyaltyController::class, 'rewards']);

    // Phase 6.17: Enterprise Security
    Route::post('/security/2fa/setup', [\App\Http\Controllers\Api\SecurityController::class, 'setup2Fa']);
    Route::get('/security/audit-logs', [\App\Http\Controllers\Api\SecurityController::class, 'auditLogs']);
});
