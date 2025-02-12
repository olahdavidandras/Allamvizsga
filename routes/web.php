<?php

//https://i.sstatic.net/aeY45.jpg
//https://www.maxfosterphotography.com/images/xl/Winter-Solstice-BW.jpg
use App\Http\Controllers\ImageEnhanceController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ImageEnhanceController::class, 'index']);
Route::post('/enhance', [ImageEnhanceController::class, 'enhance']);
Route::post('/check-status', [ImageEnhanceController::class, 'checkStatus']);

