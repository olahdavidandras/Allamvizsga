<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Post extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'title',
        'content',
        'image',
        'user_id',
        'ai_generated',
        'ai_type',
        'parent_id',
        'visible_in_gallery',
        'is_public'
    ];
    public function aiVersions()
{
    return $this->hasMany(Post::class, 'parent_id');
}
}

