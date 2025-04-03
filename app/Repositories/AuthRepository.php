<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthRepository {
    public function register(array $data) {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }

    public function login(array $credentials) {
        if (!Auth::attempt($credentials)) {
            return null;
        }
        return Auth::user()->createToken('auth_token')->plainTextToken;
    }

    public function logout() {
        Auth::user()->tokens()->delete();
    }
}

