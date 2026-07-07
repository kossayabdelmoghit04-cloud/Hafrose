<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route par défaut de Laravel Sanctum (préservée)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Routes publiques de l'API avec le rate-limiter général
Route::middleware('throttle:api')->group(function () {
    // Catégories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Produits
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Avis
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Commandes
    Route::post('/orders', [OrderController::class, 'store']);
});

// Formulaire de contact sécurisé par son propre rate-limiter strict
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');

// --- ROUTES BACK OFFICE ADMINISTRATEUR (Phase 6) ---
Route::prefix('admin')->group(function () {
    // Authentification Admin publique avec rate limiter strict
    Route::post('/login', [\App\Http\Controllers\Api\Admin\AuthController::class, 'login'])->middleware('throttle:api');

    // Routes Admin protégées
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
