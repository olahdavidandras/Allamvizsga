<?php

namespace App\Http\Controllers;

use App\Http\Requests\Image\EnhanceImageRequest;
use App\Http\Requests\Image\CheckStatusRequest;
use App\Http\Requests\Image\UploadImageRequest;
use App\Repositories\ImageEnhanceRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use App\Models\Post;
use Illuminate\Http\Request;
use App\Models\User;


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
        try {
            $apiKey = env('REPLICATE_API_TOKEN');
            $statusUrl = "https://api.replicate.com/v1/predictions/{$request->prediction_id}";
    
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $apiKey,
            ])->get($statusUrl);
    
            if ($response->failed()) {
                return response()->json([
                    'error' => 'Státusz lekérdezés sikertelen',
                    'status' => $response->status(),
                    'details' => $response->json()
                ], 400);
            }
    
            $data = $response->json();
    
            if ($data['status'] === 'succeeded' && isset($data['output'])) {
                $user = auth()->user();
                if (!$user) {
                    return response()->json(['error' => 'Nem vagy bejelentkezve!'], 401);
                }
    
                $post = Post::create([
                    'title' => 'Enhanced Image',
                    'content' => 'AI által feldolgozott kép',
                    'user_id' => $user->id,
                ]);
    
                $media = $post->addMediaFromUrl($data['output'])->toMediaCollection('images');
    
                $post->update(['image' => $media->getUrl()]);
    
                return response()->json([
                    'image_url' => $media->getUrl(),
                    'message' => 'Kép sikeresen elmentve és feldolgozva.',
                ]);
            }
    
            return response()->json($data);
        } catch (\Exception $e) {
            // \Log::error('checkStatus hiba: ' . $e->getMessage());
            return response()->json(['error' => 'Szerverhiba: ' . $e->getMessage()], 500);
        }
    }
    

    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->uploadImage($request->validated());

        return response()->json($result);
    }
}
