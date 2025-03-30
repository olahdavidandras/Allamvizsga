<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller {
    public function update(Request $request) {
        $request->validate([
            'bio' => 'nullable|string|max:1000',
            'profile_picture' => 'nullable|url',
            'website' => 'nullable|url',
        ]);

        $user = Auth::user();
        $profile = $user->profile()->updateOrCreate(
            ['user_id' => Auth::id()],
            $request->only('bio', 'profile_picture', 'website')
        );

        return response()->json($profile, 200);
    }

    public function show() {
        return response()->json(Auth::user()->profile);
    }

    public function showUserProfile($userId) {
        $profile = Profile::where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profil nem található'], 404);
        }

        return response()->json($profile);
    }
}

