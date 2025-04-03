<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Repositories\AuthRepository;
use Illuminate\Http\Request;

class AuthController extends Controller {
    protected $authRepository;

    public function __construct(AuthRepository $authRepository) {
        $this->authRepository = $authRepository;
    }

    public function register(RegisterRequest $request) {
        $user = $this->authRepository->register($request->validated());

        return response()->json([
            'message' => 'Sikeres regisztráció!',
            'user' => $user
        ], 201);
    }

    public function login(LoginRequest $request) {
        $token = $this->authRepository->login($request->validated());

        if (!$token) {
            return response()->json(['error' => 'Hibás email vagy jelszó.'], 401);
        }

        return response()->json(['message' => 'Sikeres bejelentkezés!', 'token' => $token], 200);
    }

    public function logout(Request $request) {
        $this->authRepository->logout();

        return response()->json(['message' => 'Sikeres kijelentkezés!'], 200);
    }
}

