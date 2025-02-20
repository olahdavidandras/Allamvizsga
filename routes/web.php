<?php

//https://i.sstatic.net/aeY45.jpg
//https://www.maxfosterphotography.com/images/xl/Winter-Solstice-BW.jpg
use App\Http\Controllers\ImageEnhanceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;


Route::get('/', [ImageEnhanceController::class, 'index']);
// Route::get('/', function () {
//     return view('image');
// });
Route::post('/enhance', [ImageEnhanceController::class, 'enhance']);
Route::post('/check-status', [ImageEnhanceController::class, 'checkStatus']);
Route::get('/post', [PostController::class, 'index'])->name('post.index');
Route::post('/post/store', [PostController::class, 'store'])->name('post.store');
Route::delete('/post/{post}/delete-image', [PostController::class, 'deleteImage'])->name('post.deleteImage');

Route::post('/upload-image', [ImageEnhanceController::class, 'uploadImage'])->name('image.upload');

