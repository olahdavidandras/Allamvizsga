<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6'
            ]);
    
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password'])
            ]);
    
            return response()->json(['message' => 'Sikeres regisztráció!', 'user' => $user], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
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
            throw ValidationException::withMessages([
                'email' => ['Hibás email vagy jelszó.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json(['message' => 'Sikeres bejelentkezés!', 'user_id' => $user->id, 'token' => $token],200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
    
        if (!$user) {
            return response()->json(['error' => 'Nincs bejelentkezett felhasználó.'], 401);
        }
    
        $user->tokens()->delete();
    
        return response()->json(['message' => 'Sikeres kijelentkezés!'], 200);
    }
    
    
}
