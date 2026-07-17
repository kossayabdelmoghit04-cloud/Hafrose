<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
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
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/{product}/related', [ProductController::class, 'related']);

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
    Route::post('/login', [\App\Http\Controllers\Api\Admin\AuthController::class, 'login'])
        ->middleware('throttle:admin-login');

    // Routes admin protégées (auth:sanctum + rôle admin) ─ pas de throttle supplémentaire
    // car l'accès est déjà doublement restreint (token Sanctum + middleware admin).
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Profil
        Route::post('/logout', [\App\Http\Controllers\Api\Admin\AuthController::class, 'logout']);
        Route::get('/me', [\App\Http\Controllers\Api\Admin\AuthController::class, 'me']);

        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);

        // Catégories CRUD (POST utilisé pour la mise à jour afin de gérer facilement multipart/form-data)
        Route::get('/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'index']);
        Route::post('/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'store']);
        Route::post('/categories/{category}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy']);

        // Produits CRUD (POST utilisé pour la mise à jour pour gérer l'upload multiple et spoofing de formulaire)
        Route::get('/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
        Route::post('/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
        Route::post('/products/{product}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
        Route::delete('/products/{product}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);

        // Commandes
        Route::get('/orders', [\App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
        Route::get('/orders/{order}', [\App\Http\Controllers\Api\Admin\OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [\App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus']);
        Route::get('/orders/{order}/pdf', [\App\Http\Controllers\Api\Admin\OrderController::class, 'exportPdf']);

        // Avis
        Route::get('/reviews', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'index']);
        Route::patch('/reviews/{review}/approve', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'approve']);
        Route::patch('/reviews/{review}/reject', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'reject']);
        Route::delete('/reviews/{review}', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'destroy']);

        // Contacts (Messages)
        Route::get('/contacts', [\App\Http\Controllers\Api\Admin\ContactController::class, 'index']);
        Route::patch('/contacts/{contact}/read', [\App\Http\Controllers\Api\Admin\ContactController::class, 'markAsRead']);
        Route::delete('/contacts/{contact}', [\App\Http\Controllers\Api\Admin\ContactController::class, 'destroy']);

        // Paramètres du site
        Route::get('/settings', [\App\Http\Controllers\Api\Admin\SettingController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\Api\Admin\SettingController::class, 'update']);

        // Médiathèque
        Route::get('/media', [\App\Http\Controllers\Api\Admin\MediaController::class, 'index']);
        Route::post('/media', [\App\Http\Controllers\Api\Admin\MediaController::class, 'store']);
        Route::delete('/media/{media}', [\App\Http\Controllers\Api\Admin\MediaController::class, 'destroy']);
    });
});
