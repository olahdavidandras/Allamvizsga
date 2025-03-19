<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageEnhanceController extends Controller
{
    public function index()
    {
        return view('image-enhance');
    }

    public function enhance(Request $request)
    {
        $imageId = $request->input('image_id');
        $apiType = $request->input('api_type');

        if (!$imageId || !$apiType) {
            return response()->json(['error' => 'Hiányzó kép ID vagy API típus'], 400);
        }

        $post = Post::find($imageId);
        if (!$post) {
            return response()->json(['error' => 'Nem található a kép'], 404);
        }

        $media = $post->getFirstMedia('images');
        if (!$media) {
            return response()->json(['error' => 'Nem található a kép'], 404);
        }

        $imageUrl = $media->getPath();

        $apiKey = env('REPLICATE_API_TOKEN');

        $fileResponse = Http::withHeaders([
            'Authorization' => 'Token ' . $apiKey,
        ])->attach('content', file_get_contents($imageUrl), basename($imageUrl))
        ->post('https://api.replicate.com/v1/files');

        if ($fileResponse->failed()) {
            return response()->json(['error' => 'Kép feltöltése sikertelen', 'details' => $fileResponse->json()], 500);
        }

        $fileData = $fileResponse->json();
        $uploadedImageUrl = $fileData['urls']['get'];

        $apiVersions = [
            'gfpgan' => '0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'ddcolor' => 'ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695'
        ];

        $input = ($apiType === 'gfpgan')
            ? ['img' => $uploadedImageUrl, 'scale' => 2]
            : ['image' => $uploadedImageUrl];

        $enhanceResponse = Http::withHeaders([
            'Authorization' => 'Token ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.replicate.com/v1/predictions', [
            'version' => $apiVersions[$apiType],
            'input' => $input
        ]);

        if ($enhanceResponse->failed()) {
            return response()->json([
                'error' => 'AI feldolgozás sikertelen',
                'details' => $enhanceResponse->json()
            ], 500);
        }

        $data = $enhanceResponse->json();

        return response()->json([
            'prediction_id' => $data['id'],
            'status_url' => $data['urls']['get']
        ]);
    }

    public function checkStatus(Request $request)
    {
        $predictionId = $request->input('prediction_id');
        $apiKey = env('REPLICATE_API_TOKEN');

        if (!$predictionId) {
            return response()->json(['error' => 'Hiányzó predikció ID'], 400);
        }

        $statusUrl = "https://api.replicate.com/v1/predictions/{$predictionId}";

        $response = Http::withHeaders([
            'Authorization' => 'Token ' . $apiKey,
        ])->get($statusUrl);

        if ($response->failed()) {
            return response()->json([
                'error' => 'Státusz lekérdezés sikertelen',
                'status' => $response->status(),
                'details' => $response->json()
            ], 500);
        }

        $data = $response->json();

        if ($data['status'] === 'succeeded' && isset($data['output'])) {
            $post = Post::create(['title' => 'Enhanced Image']);
            $media = $post->addMediaFromUrl($data['output'])->toMediaCollection('images');
            return response()->json(['image_url' => $media->getUrl()]);
        }
        Log::info('Replicate API válasza:', $response->json());


        return response()->json($data);
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'title' => 'required|string|max:255',
                'content' => 'required|string|max:255',
            ]);
    
            $post = Post::create([
                'title' => $request->title, 
                'content' => $request->content
            ]);            
    
            $media = $post->addMediaFromRequest('image')->toMediaCollection('images');
    
            $imageUrl = $media->getUrl();
            $post->update(['image' => $imageUrl]);
    
            return response()->json([
                'image_id' => $post->id,
                'url' => $imageUrl
            ]);
        } catch (\Exception $e) {
            Log::error('Feltöltési hiba: ' . $e->getMessage());
            return response()->json(['error' => 'Feltöltési hiba', 'message' => $e->getMessage()], 500);
        }
    }
    
}