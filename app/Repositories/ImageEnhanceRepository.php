<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ImageEnhanceRepository
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('REPLICATE_API_TOKEN');
    }

    public function uploadImage($data)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Nem vagy bejelentkezve!'], 401);
        }

        $post = Post::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'user_id' => $user->id
        ]);

        $media = $post->addMediaFromRequest('image')->toMediaCollection('images');
        $post->update(['image' => $media->getUrl()]);

        return [
            'image_id' => $post->id,
            'url' => $media->getUrl()
        ];
    }

    public function enhanceImage($imageId, $apiType)
    {
        $post = Post::find($imageId);
        if (!$post) {
            return ['error' => 'Nem található a kép'];
        }

        $media = $post->getFirstMedia('images');
        if (!$media) {
            return ['error' => 'Nem található a kép'];
        }

        $imageUrl = $media->getPath();

        $fileResponse = Http::withHeaders([
            'Authorization' => 'Token ' . $this->apiKey,
        ])->attach('content', file_get_contents($imageUrl), basename($imageUrl))
        ->post('https://api.replicate.com/v1/files');

        if ($fileResponse->failed()) {
            return ['error' => 'Kép feltöltése sikertelen', 'details' => $fileResponse->json()];
        }

        $fileData = $fileResponse->json();
        $uploadedImageUrl = $fileData['urls']['get'];

        $apiVersions = [
            'gfpgan' => '0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'ddcolor' => 'ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695'
        ];

        $input = ($apiType === 'gfpgan') ? ['img' => $uploadedImageUrl, 'scale' => 2] : ['image' => $uploadedImageUrl];

        $enhanceResponse = Http::withHeaders([
            'Authorization' => 'Token ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.replicate.com/v1/predictions', [
            'version' => $apiVersions[$apiType],
            'input' => $input
        ]);

        if ($enhanceResponse->failed()) {
            return ['error' => 'AI feldolgozás sikertelen', 'details' => $enhanceResponse->json()];
        }

        return $enhanceResponse->json();
    }

    public function checkStatus($predictionId)
    {
        $statusUrl = "https://api.replicate.com/v1/predictions/{$predictionId}";

        $response = Http::withHeaders([
            'Authorization' => 'Token ' . $this->apiKey,
        ])->get($statusUrl);

        if ($response->failed()) {
            return ['error' => 'Státusz lekérdezés sikertelen', 'status' => $response->status(), 'details' => $response->json()];
        }

        $data = $response->json();

        if ($data['status'] === 'succeeded' && isset($data['output'])) {
            $user = Auth::user();

            $enhancedPost = Post::create([
                'title' => 'Enhanced Image',
                'content' => 'AI által feldolgozott kép',
                'user_id' => $user ? $user->id : null,
            ]);

            $media = $enhancedPost->addMediaFromUrl($data['output'])->toMediaCollection('images');

            return [
                'image_id' => $enhancedPost->id,
                'url' => $media->getUrl()
            ];
        }

        Log::info('Replicate API válasza:', $response->json());

        return $data;
    }
}
