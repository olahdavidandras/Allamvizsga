<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Repositories\ProfileRepository;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    private ProfileRepository $profileRepository;

    public function __construct(ProfileRepository $profileRepository)
    {
        $this->profileRepository = $profileRepository;
    }

    public function update(UpdateProfileRequest $request)
    {
        $userId = Auth::id();
        $data   = $request->validated();
    
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')
                            ->store('profile_images', 'public');
            $data['profile_picture'] = '/storage/' . $path;
        }
    
        $profile = $this->profileRepository
                        ->updateOrCreate($userId, $data);
    
        return response()->json($profile, 200);
    }
    

    public function show()
    {
        return response()->json($this->profileRepository->getByUserId(Auth::id()));
    }

    public function showUserProfile($userId)
    {
        $profile = $this->profileRepository->getByUserId($userId);

        if (!$profile) {
            return response()->json(['error' => 'Profil nem található'], 404);
        }

        return response()->json($profile);
    }
}
