<?php

namespace App\Http\Controllers;

use App\Models\ImageEnhance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Post;
use Illuminate\Support\Facades\Log;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;


class ImageEnhanceController extends Controller
{
    public function index()
    {
        return view('image-enhance');
    }

    public function enhance(Request $request)
    {
        $imageUrl = $request->input('image_url');
        $apiType = $request->input('api_type');

        if (!$imageUrl || !$apiType) {
            return response()->json(['error' => 'Hiányzó kép URL vagy API típus'], 400);
        }

        $apiKey = env('REPLICATE_API_KEY');

        $apiVersions = [
            'gfpgan' => '0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'ddcolor' => 'ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695'
        ];

        $input = ($apiType === 'gfpgan')
            ? ['img' => $imageUrl, 'scale' => 2]
            : ['image' => $imageUrl];

        $response = Http::withHeaders([
            'Authorization' => 'Token ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.replicate.com/v1/predictions', [
            'version' => $apiVersions[$apiType],
            'input' => $input
        ]);

        if ($response->failed()) {
            return response()->json([
                'error' => 'API hívás sikertelen',
                'details' => $response->json()
            ], 500);
        }

        $data = $response->json();
        return response()->json([
            'prediction_id' => $data['id'],
            'status_url' => $data['urls']['get']
        ]);
    }

    public function checkStatus(Request $request)
    {
        $predictionId = $request->input('prediction_id');
        $apiKey = env('REPLICATE_API_KEY');

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

        return response()->json($response->json());
    }
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $post = Post::create(['title' => 'Uploaded Image']);
            $post->addMediaFromRequest('image')->toMediaCollection('images');

            return response()->json(['url' => asset('storage/' . $post->getFirstMedia('images')->id . '/' . $post->getFirstMedia('images')->file_name)]);
        } catch (\Exception $e) {
            Log::error('Feltöltési hiba: ' . $e->getMessage());
            return response()->json(['error' => 'Feltöltési hiba', 'message' => $e->getMessage()], 500);
        }
    }

    

}
