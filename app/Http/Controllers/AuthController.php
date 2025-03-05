<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);
    
        try {
            $user = User::create([
                'name' => $request->name,  
                'email' => $request->email,
                'password' => Hash::make($request->password)
            ]);
    
            return response()->json(['message' => 'Sikeres regisztráció!', 'user' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Hiba történt!', 'details' => $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
    
        $user = User::where('email', $request->email)->first();
    
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Hibás email vagy jelszó!'], 401);
        }
    
        return response()->json(['message' => 'Sikeres bejelentkezés!', 'user_id' => $user->id]);
    }
}
