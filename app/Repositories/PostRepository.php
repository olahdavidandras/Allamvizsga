<?php

namespace App\Repositories;

use App\Models\Post;

class PostRepository
{
    public function getAllPosts()
    {
        return Post::all();
    }

    public function createPost($data)
    {
        return Post::create($data);
    }

    public function addImage($post, $image)
    {
        return $post->addMedia($image)->toMediaCollection('images');
    }

    public function deleteImage($post)
    {
        if ($post->getFirstMedia('images')) {
            $post->clearMediaCollection('images');
        }
    }

    public function updatePost(Post $post, array $data)
    {
        $post->update($data);
        return $post;
    }

    public function deletePost(Post $post)
    {
        $post->delete();
    }
}