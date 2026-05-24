<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\VerifikasiController;
use App\Http\Controllers\Api\Customer\VerifikasiController as CustomerVerifikasi;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Admin\BarangController;
use App\Http\Controllers\Api\Admin\KategoriController;
use App\Http\Controllers\Api\Admin\DestinasiController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Middleware\RoleMiddleware;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/refresh', [AuthController::class, 'refresh']);

/*
|--------------------------------------------------------------------------
| PROTECTED (LOGIN REQUIRED)
|--------------------------------------------------------------------------
*/
Route::middleware(['jwt.auth'])->group(function () {

    // 🔐 Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // 🔔 Notifikasi (semua role)
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/{id}/read', [NotifikasiController::class, 'markRead']);
    Route::delete('/notifikasi/{id}', [NotifikasiController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */
    Route::prefix('customer')->group(function () {
        // 🔥 upload KTP
        Route::post('/verifikasi', [CustomerVerifikasi::class, 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    |*/
    Route::middleware([RoleMiddleware::class . ':admin'])->prefix('admin')->group(function () {

        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // 🔥 CRUD Users
        Route::post('/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
        Route::apiResource('/users', AdminController::class);

        // 🔥 verifikasi KTP
        Route::get('/verifikasi', [VerifikasiController::class, 'index']);
        Route::get('/verifikasi/{id}', [VerifikasiController::class, 'show']);
        Route::post('/verifikasi/{id}/approve', [VerifikasiController::class, 'approve']);
        Route::post('/verifikasi/{id}/reject', [VerifikasiController::class, 'reject']);

        // 🔥 Barang
        Route::get('/barang', [BarangController::class, 'index']);
        Route::get('/barang/{id}', [BarangController::class, 'show']);
        Route::put('/barang/{id}', [BarangController::class, 'update']);
        Route::post('/barang/{id}', [BarangController::class, 'update']); // untuk FormData + _method=PUT
        Route::delete('/barang/{id}', [BarangController::class, 'destroy']);

        // 🔥 Kategori & Destinasi
        Route::apiResource('/kategori', KategoriController::class);
        Route::apiResource('/destinasi', DestinasiController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/photo', [ProfileController::class, 'updatePhoto']);
        Route::delete('/photo', [ProfileController::class, 'deletePhoto']);
        Route::post('/password', [ProfileController::class, 'updatePassword']);
        Route::post('/rental', [ProfileController::class, 'openRental']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });
});
