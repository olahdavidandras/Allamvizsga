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
            return response()->json(['error' => 'Nem vagy bejelentkezve!'], 401);
        }

        // Creează un nou post (înregistrare)
        $post = Post::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'user_id' => $user->id
        ]);

        // Adaugă imaginea în colecția MediaLibrary și actualizează URL-ul
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
     * @return array Răspunsul complet de la API-ul Replicate.
     */
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

        // Se obține calea locală a imaginii
        $imageUrl = $media->getPath();

        // Se trimite imaginea către Replicate ca fișier
        $fileResponse = Http::withHeaders([
            'Authorization' => 'Token ' . $this->apiKey,
        ])->attach('content', file_get_contents($imageUrl), basename($imageUrl))
        ->post('https://api.replicate.com/v1/files');

        if ($fileResponse->failed()) {
            return ['error' => 'Kép feltöltése sikertelen', 'details' => $fileResponse->json()];
        }

        $fileData = $fileResponse->json();
        $uploadedImageUrl = $fileData['urls']['get'];

        // Se selectează versiunea corectă de model AI în funcție de tip
        $apiVersions = [
            'gfpgan' => '0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'ddcolor' => 'ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695'
        ];

        // Se pregătește inputul specific pentru fiecare model
        $input = ($apiType === 'gfpgan') ? ['img' => $uploadedImageUrl, 'scale' => 2] : ['image' => $uploadedImageUrl];

        // Se trimite cererea de procesare la Replicate
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
     * @return array Informații despre imaginea procesată sau stare curentă.
     */
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

        // Dacă procesarea a fost finalizată cu succes, se salvează imaginea în aplicație
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
