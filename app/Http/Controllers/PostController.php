<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\DeleteImageRequest;
use App\Repositories\PostRepository;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected $postRepository;

    public function __construct(PostRepository $postRepository)
    {
        $this->postRepository = $postRepository;
    }

    public function index()
    {
        $posts = $this->postRepository->getAllPosts();
        return view('post', compact('posts'));
    }

    public function store(StorePostRequest $request)
    {
        $post = $this->postRepository->createPost($request->only(['title', 'content']));

        if ($request->hasFile('image')) {
            $this->postRepository->addImage($post, $request->file('image'));
        }

        return back()->with('success', 'Post létrehozva!');
    }

    public function deleteImage(DeleteImageRequest $request, Post $post)
    {
        $this->postRepository->deleteImage($post);
        return back()->with('success', 'Kép törölve!');
    }
}
