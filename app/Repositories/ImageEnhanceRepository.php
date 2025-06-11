<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Clasa ImageEnhanceRepository gestionează operațiile de încărcare,
 * procesare AI (prin API-ul Replicate) și salvare a imaginilor procesate.
 */
class ImageEnhanceRepository
{
    protected $apiKey;

    /**
     * Constructorul clasei – obține cheia API din fișierul de mediu (.env).
     */
    public function __construct()
    {
        $this->apiKey = env('REPLICATE_API_TOKEN');
    }

    /**
     * Încarcă o imagine și creează un nou obiect Post asociat utilizatorului curent.
     *
     * @param array $data Datele imaginii: titlu și descriere.
     * @return array ID-ul imaginii și URL-ul imaginii salvate.
     */
    public function uploadImage($data)
    {
        $user = Auth::user();
        if (!$user) {
            return ['error' => 'Nem vagy bejelentkezve!'];
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

    /**
     * Trimite o imagine la procesare AI folosind API-ul Replicate.
     *
     * @param int $imageId ID-ul postării (Post) care conține imaginea.
     * @param string $apiType Tipul procesării: 'gfpgan' sau 'ddcolor'.
     * @return array Răspunsul complet de la API-ul Replicate sau eroare.
     */
    public function enhanceImage($imageId, $apiType)
    {
        $post = Post::find($imageId);
        if (!$post) {
            return ['error' => 'Nem található a kép'];
        }

        $media = $post->getFirstMedia('images');
        if (!$media) {
            return ['error' => 'Nem található a médiafájl'];
        }

        // Obține calea locală a imaginii și o trimite ca fișier la Replicate
        $imageUrl = $media->getPath();

        $fileResponse = Http::withHeaders([
            'Authorization' => 'Token ' . $this->apiKey,
        ])->attach('content', file_get_contents($imageUrl), basename($imageUrl))
          ->post('https://api.replicate.com/v1/files');

        if ($fileResponse->failed()) {
            return ['error' => 'Kép feltöltése sikertelen', 'details' => $fileResponse->json()];
        }

        $uploadedImageUrl = $fileResponse->json()['urls']['get'];

        // Selectează versiunea modelului AI
        $apiVersions = [
            'gfpgan' => '0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'ddcolor' => 'ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695'
        ];

        // Pregătește inputul în funcție de modelul AI
        $input = ($apiType === 'gfpgan') 
            ? ['img' => $uploadedImageUrl, 'scale' => 2] 
            : ['image' => $uploadedImageUrl];

        // Trimite cererea de procesare către Replicate
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

    /**
     * Verifică starea unei cereri de procesare AI și salvează imaginea finală dacă este gata.
     *
     * @param string $predictionId ID-ul predicției returnat de Replicate.
     * @param int $parentId ID-ul imaginii originale.
     * @param string $aiType Tipul procesării: 'gfpgan' sau 'ddcolor'.
     * @return array Informații despre imaginea procesată sau stare curentă.
     */
    public function checkStatus($predictionId, $parentId, $aiType)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Token ' . $this->apiKey,
        ])->get("https://api.replicate.com/v1/predictions/{$predictionId}");

        if ($response->failed()) {
            return [
                'error' => 'Státusz lekérdezés sikertelen',
                'status' => $response->status(),
                'details' => $response->json()
            ];
        }

        $data = $response->json();

        // Dacă imaginea este procesată cu succes, salvează rezultatul în baza de date
        if ($data['status'] === 'succeeded' && isset($data['output'])) {
            $user = Auth::user();

            $post = Post::create([
                'title' => 'Enhanced Image',
                'content' => 'AI által feldolgozott kép',
                'user_id' => $user?->id,
                'ai_generated' => true,
                'ai_type' => $aiType,
                'parent_id' => $parentId,
                'visible_in_gallery' => false,
            ]);

            $media = $post->addMediaFromUrl($data['output'])->toMediaCollection('images');
            $post->update(['image' => $media->getUrl()]);

            return [
                'image_url' => $media->getUrl(),
                'message' => 'Kép sikeresen elmentve és feldolgozva.',
                'image_id' => $post->id
            ];
        }

        Log::info('Replicate API válasza:', $response->json());

        return $data;
    }
}
