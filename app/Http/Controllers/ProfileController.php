<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Repositories\ProfileRepository;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * @var ProfileRepository
     * Repository responsabil pentru operațiile asupra profilului utilizatorului.
     */
    private ProfileRepository $profileRepository;

    /**
     * Constructorul clasei. Primește o instanță a repository-ului de profiluri.
     *
     * @param ProfileRepository $profileRepository
     */
    public function __construct(ProfileRepository $profileRepository)
    {
        $this->profileRepository = $profileRepository;
    }

    /**
     * Actualizează sau creează un profil pentru utilizatorul autentificat.
     * Acceptă și imagine de profil opțională.
     *
     * @param UpdateProfileRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateProfileRequest $request)
    {
        $userId = Auth::id(); // Obține ID-ul utilizatorului curent autentificat
        $data   = $request->validated(); // Datele validate din request
    
        // Verifică dacă a fost trimisă o imagine nouă de profil
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')
                            ->store('profile_images', 'public');
            $data['profile_picture'] = '/storage/' . $path;
        }
    
        // Actualizează sau creează profilul cu datele primite
        $profile = $this->profileRepository
                        ->updateOrCreate($userId, $data);
    
        return response()->json($profile, 200); // Returnează profilul actualizat
    }
    

        /**
     * Returnează profilul utilizatorului autentificat.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        return response()->json($this->profileRepository->getByUserId(Auth::id()));
    }

    /**
     * Returnează profilul unui utilizator specific, după ID.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showUserProfile($userId)
    {
        $profile = $this->profileRepository->getByUserId($userId);

        if (!$profile) {
            return response()->json(['error' => 'Profil nem található'], 404);
        }

        return response()->json($profile);
    }
}
