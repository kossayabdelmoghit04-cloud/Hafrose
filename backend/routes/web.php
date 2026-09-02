<?php

use App\Http\Controllers\Api\PublicHealthCheckController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health', [PublicHealthCheckController::class, 'check']);
