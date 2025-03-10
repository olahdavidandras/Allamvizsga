<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImageEnhanceController;
use App\Http\Controllers\PostController;
// use App\Http\Controllers\ReplicateController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/enhance', [ImageEnhanceController::class, 'enhance']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


// Route::post('/enhance', [ImageEnhanceController::class, 'enhance'])->middleware('auth:sanctum');

