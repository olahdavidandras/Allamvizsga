<?php

//https://i.sstatic.net/aeY45.jpg
//https://www.maxfosterphotography.com/images/xl/Winter-Solstice-BW.jpg
use App\Http\Controllers\ImageEnhanceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReplicateController;
use App\Services\Replicate;
use App\Http\Controllers\AuthController;



// // Route::get('/', [ImageEnhanceController::class, 'index']);
// Route::get('/', function () {
//     return view('image');
// });
Route::get('/{any}', function () {
    return view('image');
})->where('any', '.*');
// Route::post('/enhance', [ImageEnhanceController::class, 'enhance']);
// Route::post('/check-status', [ImageEnhanceController::class, 'checkStatus']);
// Route::get('/post', [PostController::class, 'index'])->name('post.index');
// Route::post('/post/store', [PostController::class, 'store'])->name('post.store');
// Route::delete('/post/{post}/delete-image', [PostController::class, 'deleteImage'])->name('post.deleteImage');

// Route::post('/upload-image', [ImageEnhanceController::class, 'uploadImage'])->name('image.upload');

// Route::post('/APIEnhance', [ReplicateController::class, 'enhanceImage']);

// Route::post('/register', [AuthController::class, 'register']);
// Route::post('/login', [AuthController::class, 'login']);