<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\BarangController;
use App\Http\Controllers\Api\Admin\AdminBarangController;
use App\Http\Controllers\Api\Admin\KategoriController;
use App\Http\Controllers\Api\Admin\DestinasiController;
use App\Http\Controllers\Api\Admin\TransaksiController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Google Auth
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Refresh token (allow expired JWT to be refreshed)
Route::post('/refresh', [AuthController::class, 'refresh']);

// Protected routes
Route::middleware(['jwt.auth'])->group(function () {
    // Auth & Profile (Common for all)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Catalog routes (Common for all roles)
    Route::get('/kategori', [KategoriController::class, 'index']);
    Route::get('/destinasi', [DestinasiController::class, 'index']);
    Route::get('/barang', [BarangController::class, 'index']);

    // Customer specific routes
    Route::middleware(['role:customer'])->group(function () {
        Route::post('/barang', [BarangController::class, 'store']); // Menyewakan barang (butuh approval)
        Route::get('/barang/my-items', [BarangController::class, 'myItems']); // Lihat barang milik sendiri

        // Transaksi (Sewa Barang)
        Route::post('/transaksi', [TransaksiController::class, 'store']);
        Route::get('/transaksi/history', [TransaksiController::class, 'myHistory']);
    });
});

// Admin only routes
Route::middleware(['jwt.auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::get('/admin/users/{id}', [AdminController::class, 'getUserById']);
    Route::post('/admin/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

    // Admin approval for Barang
    Route::get('/admin/barang/pending', [AdminBarangController::class, 'pendingItems']);
    Route::post('/admin/barang/{id}/approve', [AdminBarangController::class, 'approve']);
    Route::post('/admin/barang/{id}/reject', [AdminBarangController::class, 'reject']);

    // Manage Kategori & Destinasi
    Route::post('/admin/kategori', [KategoriController::class, 'store']);
    Route::put('/admin/kategori/{id}', [KategoriController::class, 'update']);
    Route::delete('/admin/kategori/{id}', [KategoriController::class, 'destroy']);

    Route::post('/admin/destinasi', [DestinasiController::class, 'store']);
    Route::put('/admin/destinasi/{id}', [DestinasiController::class, 'update']);
    Route::delete('/admin/destinasi/{id}', [DestinasiController::class, 'destroy']);
});

// Profile routes (protected)
Route::middleware(['jwt.auth'])->prefix('profile')->group(function () {
    Route::get('/', [ProfileController::class, 'show']);
    Route::put('/', [ProfileController::class, 'update']);
    Route::post('/photo', [ProfileController::class, 'updatePhoto']);
    Route::delete('/photo', [ProfileController::class, 'deletePhoto']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);
    Route::post('/upload-ktp', [ProfileController::class, 'uploadKTP']);
    Route::delete('/', [ProfileController::class, 'destroy']);
});
