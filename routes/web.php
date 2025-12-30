<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\language\LanguageController;
use App\Http\Controllers\pages\HomePage;
use App\Http\Controllers\pages\Page2;
use App\Http\Controllers\pages\MiscError;
use App\Http\Controllers\authentications\LoginBasic;
use App\Http\Controllers\authentications\RegisterBasic;

// Main Page Route
Route::get('/', [HomePage::class, 'index'])->name('pages-home');
Route::get('/page-2', [Page2::class, 'index'])->name('pages-page-2');

// locale
Route::get('/lang/{locale}', [LanguageController::class, 'swap']);
Route::get('/pages/misc-error', [MiscError::class, 'index'])->name('pages-misc-error');

// authentication
Route::get('/auth/login-basic', [LoginBasic::class, 'index'])->name('auth-login-basic');
Route::get('/auth/register-basic', [RegisterBasic::class, 'index'])->name('auth-register-basic');

Route::group(['prefix' => 'access'], function () {
  Route::get('/', [App\Http\Controllers\AccessController::class, 'index'])->name('access-index');
  Route::get('/table', [App\Http\Controllers\AccessController::class, 'table'])->name('access-table');
  Route::post('/available', [App\Http\Controllers\AccessController::class, 'checkAvailable'])->name('access-available');
  Route::post('/device', [App\Http\Controllers\AccessController::class, 'getStatusDevice'])->name('access-device');
});

Route::group(['prefix' => 'monitoring'], function () {
  Route::get('/', [App\Http\Controllers\MonitoringController::class, 'index'])->name('monitoring-index');
  Route::post('/table', [App\Http\Controllers\MonitoringController::class, 'table'])->name('monitoring-table');
  Route::get('/sse', [App\Http\Controllers\MonitoringController::class, 'sseHistory'])->name('monitoring-sse');
});
