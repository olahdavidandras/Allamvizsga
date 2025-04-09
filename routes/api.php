<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImageEnhanceController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/enhance', [ImageEnhanceController::class, 'enhance']);
    Route::post('/check-status', [ImageEnhanceController::class, 'checkStatus']);

    Route::get('/post', [PostController::class, 'index'])->name('post.index');
    Route::post('/post/store', [PostController::class, 'store'])->name('post.store');
    Route::delete('/post/{post}/delete-image', [PostController::class, 'deleteImage'])->name('post.deleteImage');

    Route::post('/upload-image', [ImageEnhanceController::class, 'uploadImage'])->name('image.upload');

    Route::post('/comments', [CommentController::class, 'store']);
    Route::get('/posts/{postId}/comments', [CommentController::class, 'getPostComments']);
    Route::get('/users/{userId}/comments', [CommentController::class, 'getUserComments']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile-update', [ProfileController::class, 'update']);
    Route::get('/users/{userId}/profile', [ProfileController::class, 'showUserProfile']);
});