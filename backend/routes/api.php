<?php

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| SiPetualang API Routes
| Base URL: /api
|
*/

// ─── Public Routes ──────────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// ─── Authenticated Routes ───────────────────────────────────────────────

Route::middleware('auth:api')->group(function () {

    // Auth management
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // ─── Super Admin Routes ─────────────────────────────────────────
    Route::prefix('admin')->middleware('role:super_admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);

        // TODO: Phase 2 — CRUD controllers
        // Route::apiResource('users', Admin\UserController::class);
        // Route::apiResource('gears', Admin\GearController::class);
        // Route::apiResource('categories', Admin\CategoryController::class);
        // Route::apiResource('destinations', Admin\DestinationController::class);
        // Route::apiResource('gear-standards', Admin\GearStandardController::class);
        // Route::apiResource('transactions', Admin\TransactionController::class);
        // Route::apiResource('payments', Admin\PaymentController::class);
        // Route::get('ktp-verification', [Admin\KtpVerificationController::class, 'index']);
        // Route::post('ktp-verification/{user}/approve', [Admin\KtpVerificationController::class, 'approve']);
        // Route::post('ktp-verification/{user}/reject', [Admin\KtpVerificationController::class, 'reject']);
        // Route::apiResource('deposits', Admin\DepositController::class);
    });

    // ─── Vendor (Gear Owner) Routes ────────────────────────────────
    Route::prefix('vendor')->middleware('role:vendor')->group(function () {
        // TODO: Phase 2
        // Route::apiResource('gears', Vendor\GearController::class);
        // Route::get('transactions', [Vendor\TransactionController::class, 'index']);
        // Route::get('dashboard', [Vendor\DashboardController::class, 'index']);
    });

    // ─── Customer Routes ────────────────────────────────────────────
    Route::prefix('customer')->middleware('role:customer')->group(function () {
        // TODO: Phase 2
        // Route::get('gears', [Customer\GearController::class, 'index']);
        // Route::get('gears/{gear}', [Customer\GearController::class, 'show']);
        // Route::apiResource('transactions', Customer\TransactionController::class)->only(['index', 'store', 'show']);
        // Route::post('payments', [Customer\PaymentController::class, 'store']);
    });
});
