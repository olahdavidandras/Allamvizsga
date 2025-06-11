<?php

namespace App\Http\Controllers;

use App\Http\Requests\Image\EnhanceImageRequest;
use App\Http\Requests\Image\CheckStatusRequest;
use App\Http\Requests\Image\UploadImageRequest;
use App\Repositories\ImageEnhanceRepository;
use Illuminate\Http\JsonResponse;

/**
 * Clasa ImageEnhanceController gestionează rutele API care implică încărcarea,
 * procesarea și verificarea imaginilor prin modelul AI (Replicate API).
 */
class ImageEnhanceController extends Controller
{
    protected $imageEnhanceRepository;

    /**
     * Constructorul clasei – injectează repository-ul pentru procesarea imaginilor.
     */
    public function __construct(ImageEnhanceRepository $imageEnhanceRepository)
    {
        $this->imageEnhanceRepository = $imageEnhanceRepository;
    }

    /**
     * Returnează o pagină de test (opțional).
     */
    public function index()
    {
        return view('image-enhance');
    }

    /**
     * Primește o imagine și o salvează în baza de date și MediaLibrary.
     *
     * @param UploadImageRequest $request – datele validate ale imaginii.
     * @return JsonResponse – răspuns JSON cu ID-ul și URL-ul imaginii.
     */
    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->uploadImage($request->validated());

        return response()->json($result);
    }

    /**
     * Trimite o imagine spre procesare AI (Replicate) și returnează ID-ul predicției.
     *
     * @param EnhanceImageRequest $request – ID-ul imaginii și tipul de AI.
     * @return JsonResponse – răspuns JSON cu prediction_id și status_url.
     */
    public function enhance(EnhanceImageRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->enhanceImage(
            $request->image_id,
            $request->api_type
        );

        if (isset($result['error'])) {
            return response()->json($result, 400);
        }

        return response()->json([
            'prediction_id' => $result['id'],
            'status_url' => $result['urls']['get']
        ]);
    }

    /**
     * Verifică starea unei cereri de procesare AI și salvează rezultatul dacă este gata.
     *
     * @param CheckStatusRequest $request – prediction_id, parent_id, ai_type.
     * @return JsonResponse – răspuns JSON cu URL-ul imaginii procesate sau stare.
     */
    public function checkStatus(CheckStatusRequest $request): JsonResponse
    {
        $result = $this->imageEnhanceRepository->checkStatus(
            $request->prediction_id,
            $request->parent_id,
            $request->ai_type
        );

        if (isset($result['error'])) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }
}
