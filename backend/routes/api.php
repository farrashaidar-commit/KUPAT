<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\InsightsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - KUPAT Sprint 1
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Public Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Authentication Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // KUPAT Main REST Routes
    Route::apiResource('/categories', CategoryController::class);
    Route::apiResource('/budgets', BudgetController::class);
    Route::apiResource('/transactions', TransactionController::class);

    // KUPAT Smart Insights
    Route::get('/financial-health', [InsightsController::class, 'getHealthScore']);
    Route::get('/financial-insights', [InsightsController::class, 'getInsights']);
});
