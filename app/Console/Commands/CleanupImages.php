<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;

class CleanupImages extends Command
{
    /**
     * A parancs azonosítója.
     */
    protected $signature = 'cleanup:images {--only-ai : Csak az AI által generált képek törlése}';

    /**
     * A parancs leírása.
     */
    protected $description = 'Összes kép törlése a MediaLibraryból és adatbázisból (vagy csak az AI generáltak)';

    /**
     * Parancs futtatása.
     */
    public function handle()
    {
        $onlyAi = $this->option('only-ai');

        $query = $onlyAi
            ? Post::where('ai_generated', true)
            : Post::query();

        $total = $query->count();

        if ($total === 0) {
            $this->info('Nincs törölhető bejegyzés.');
            return;
        }

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $query->each(function ($post) use ($bar) {
            $post->clearMediaCollection('images');
            $post->delete();
            $bar->advance();
        });

        $bar->finish();
        $this->newLine();
        $this->info("✅ {$total} post törölve a képekkel együtt.");
    }
}

// php artisan cleanup:images
