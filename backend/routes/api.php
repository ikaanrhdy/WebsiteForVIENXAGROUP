<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Customer;
use App\Http\Controllers\Api\Customer\ProductReviewController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

// ---------- Publik ----------

// Paket layanan (Web & IT)
Route::get('/packages', [PackageController::class, 'index']);

// Berita publik — terbaru di homepage & detail di halaman berita
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show'])->where('slug', '[\w-]+');

// Produk jual beli teknologi (Web & IT + dashboard user)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show'])->whereNumber('id');

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile', [AuthController::class, 'updateProfile']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'read']);
});

// ---------- Super Admin ----------
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', Admin\DashboardController::class);

    Route::get('/users', [Admin\UserController::class, 'index']);
    Route::put('/users/{user}', [Admin\UserController::class, 'update']);
    Route::delete('/users/{user}', [Admin\UserController::class, 'destroy']);

    Route::get('/orders', [Admin\OrderController::class, 'index']);
    Route::put('/orders/{order}', [Admin\OrderController::class, 'update']);
    Route::get('/pengadaan', [Admin\ProcurementRequestController::class, 'index']);
    Route::get('/pengadaan/{procurementRequest}', [Admin\ProcurementRequestController::class, 'show']);
    Route::put('/pengadaan/{procurementRequest}', [Admin\ProcurementRequestController::class, 'update']);
    Route::get('/sales-chat/conversations', [Admin\SalesChatController::class, 'conversations']);
    Route::get('/sales-chat/{userId}/messages', [Admin\SalesChatController::class, 'index']);
    Route::post('/sales-chat/{userId}/messages', [Admin\SalesChatController::class, 'store']);

    Route::apiResource('packages', Admin\PackageController::class)->except('show');

    // Berita (super admin bisa tambah/ubah/hapus, sertakan foto)
    Route::apiResource('news', Admin\NewsController::class)->except('show');

    // Produk jual beli teknologi (super admin)
    Route::apiResource('products', Admin\ProductController::class)->except('show');

    // Upload gambar (base64) untuk berita & produk
    Route::post('/upload/image', [Admin\UploadController::class, 'store']);
});

// ---------- User (pembeli) ----------
Route::middleware(['auth:sanctum', 'role:user'])->prefix('me')->group(function () {
    Route::get('/dashboard', Customer\DashboardController::class);
    Route::get('/orders', [Customer\OrderController::class, 'index']);
    Route::post('/orders', [Customer\OrderController::class, 'store']);
    Route::post('/orders/{id}/cancel', [Customer\OrderController::class, 'cancel']);
    Route::get('/pengadaan', [Customer\ProcurementRequestController::class, 'index']);
    Route::post('/pengadaan', [Customer\ProcurementRequestController::class, 'store']);
    Route::get('/cart', [Customer\CartController::class, 'index']);
    Route::post('/cart/items', [Customer\CartController::class, 'store']);
    Route::put('/cart/items/{id}', [Customer\CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [Customer\CartController::class, 'destroy']);
    Route::post('/cart/checkout', [Customer\CartController::class, 'checkout']);
    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);
    Route::get('/sales-chat', [Customer\SalesChatController::class, 'index']);
    Route::post('/sales-chat', [Customer\SalesChatController::class, 'store']);
});
