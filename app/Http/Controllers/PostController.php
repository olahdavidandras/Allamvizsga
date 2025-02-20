<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::all();
        return view('post', compact('posts'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $post = Post::create($request->only(['title', 'content']));

        if ($request->hasFile('image')) {
            $post->addMedia($request->file('image'))->toMediaCollection('images');
        }

        return back()->with('success', 'Post létrehozva!');
    }

    public function deleteImage(Post $post)
    {
        if ($post->getFirstMedia('images')) {
            $post->clearMediaCollection('images');
        }

        return back()->with('success', 'Kép törölve!');
    }
}
