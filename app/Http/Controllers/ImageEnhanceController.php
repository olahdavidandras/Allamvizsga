<?php

namespace App\Http\Controllers;

use App\Http\Requests\Image\EnhanceImageRequest;
use App\Http\Requests\Image\CheckStatusRequest;
use App\Http\Requests\Image\UploadImageRequest;
use App\Repositories\ImageEnhanceRepository;
use Illuminate\Http\JsonResponse;

class ImageEnhanceController extends Controller
{
    protected $imageEnhanceRepository;

    public function __construct(ImageEnhanceRepository $imageEnhanceRepository)
    {
        $this->imageEnhanceRepository = $imageEnhanceRepository;
    }

    public function index()
    {
        return view('image-enhance');
    }

    public function enhance(EnhanceImageRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->enhanceImage($request->image_id, $request->api_type);

        if (isset($result['error'])) {
            return response()->json($result, 400);
        }

        return response()->json([
            'prediction_id' => $result['id'],
            'status_url' => $result['urls']['get']
        ]);
    }

    public function checkStatus(CheckStatusRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->checkStatus($request->prediction_id);

        if (isset($result['error'])) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->uploadImage($request->validated());

        return response()->json($result);
    }
}
