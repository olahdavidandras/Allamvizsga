<?php

namespace App\Repositories;

use App\Models\Profile;

class ProfileRepository
{
    public function updateOrCreate(int $userId, array $data): Profile
    {
        return Profile::updateOrCreate(['user_id' => $userId], $data);
    }

    public function getByUserId(int $userId): ?Profile
    {
        return Profile::where('user_id', $userId)->first();
    }
}
