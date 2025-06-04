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
    /**
     * @var ImageEnhanceRepository
     * Repository responsabil pentru funcționalitățile de îmbunătățire a imaginilor prin AI.
     */
    protected $imageEnhanceRepository;

    /**
     * Constructorul clasei. Primește repository-ul de procesare imagini.
     *
     * @param ImageEnhanceRepository $imageEnhanceRepository
     */
    public function __construct(ImageEnhanceRepository $imageEnhanceRepository)
    {
        $this->imageEnhanceRepository = $imageEnhanceRepository;
    }

    /**
     * Returnează view-ul principal pentru funcția de îmbunătățire a imaginilor.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        return view('image-enhance');
    }

    /**
     * Trimite o imagine selectată către API-ul Replicate pentru procesare AI.
     *
     * @param EnhanceImageRequest $request
     * @return JsonResponse
     */
    public function enhance(EnhanceImageRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->enhanceImage($request->image_id, $request->api_type);

        // Dacă apare o eroare, returnează un răspuns cu cod 400
        if (isset($result['error'])) {
            return response()->json($result, 400);
        }

        // Returnează ID-ul procesului și URL-ul de verificare
        return response()->json([
            'prediction_id' => $result['id'],
            'status_url' => $result['urls']['get']
        ]);
    }

    /**
     * Verifică starea curentă a procesului AI de procesare imagine folosind prediction_id.
     *
     * @param CheckStatusRequest $request
     * @return JsonResponse
     */
    public function checkStatus(CheckStatusRequest $request): JsonResponse
    {
        try {
            $apiKey = env('REPLICATE_API_TOKEN');
            $statusUrl = "https://api.replicate.com/v1/predictions/{$request->prediction_id}";
    
            // Efectuează cererea HTTP pentru a obține statusul procesării
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
    
            // Dacă procesarea AI a fost un succes și avem output
            if ($data['status'] === 'succeeded' && isset($data['output'])) {
                $user = auth()->user();
                if (!$user) {
                    return response()->json(['error' => 'Nem vagy bejelentkezve!'], 401);
                }

                 // Creează o nouă postare cu imaginea procesată
                $post = Post::create([
                    'title' => 'Enhanced Image',
                    'content' => 'AI által feldolgozott kép',
                    'user_id' => $user->id,
                ]);
    
                // Salvează imaginea procesată în colecția MediaLibrary
                $media = $post->addMediaFromUrl($data['output'])->toMediaCollection('images');

                // Actualizează câmpul image al postării
                $post->update(['image' => $media->getUrl()]);
    
                return response()->json([
                    'image_url' => $media->getUrl(),
                    'message' => 'Kép sikeresen elmentve és feldolgozva.',
                ]);
            }

            // Returnează direct datele dacă statusul nu este încă finalizat
            return response()->json($data);
        } catch (\Exception $e) {
            // Returnează eroare în caz de excepție de sistem
            return response()->json(['error' => 'Szerverhiba: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Încarcă o imagine selectată de utilizator în baza de date și MediaLibrary.
     *
     * @param UploadImageRequest $request
     * @return JsonResponse
     */
    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
         // Trimite datele validate către repository pentru salvare
        $result = $this->imageEnhanceRepository->uploadImage($request->validated());

        return response()->json($result);
    }
}
