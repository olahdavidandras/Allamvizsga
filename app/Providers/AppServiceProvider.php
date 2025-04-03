<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use BenBjurstrom\Replicate\Replicate;
use App\Repositories\AuthRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(Replicate::class, function () {
            return new Replicate(
                config('services.replicate.api_token')
            );
        });
    }

}