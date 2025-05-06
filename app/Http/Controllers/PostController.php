<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\DeletePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Requests\Post\PublicPostsRequest;
use App\Http\Requests\Post\TogglePublicRequest;
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

    public function update(UpdatePostRequest $request, Post $post)
    {
        $this->postRepository->updatePost($post, $request->only(['title', 'content']));
        return response()->json(['message' => 'Post sikeresen frissítve!']);
    }

    public function destroy(Post $post, DeletePostRequest $request)
    {
        $post->delete();
        return response()->json(['message' => 'Post törölve!']);
    }

    public function publicPosts(PublicPostsRequest $request)
    {
        $posts = $this->postRepository->getPublicPosts();
        return response()->json($posts);
    }

    public function togglePublic(TogglePublicRequest $request)
    {
        $user = auth()->user();
        $postId = $request->input('post_id');
        $post = $user->posts()->find($postId);
        if (!$post) {
            return response()->json(['message' => 'Post nem található vagy nem a tiéd.'], 404);
        }
        $updatedPost = $this->postRepository->togglePublic($post);
        return response()->json([
            'message' => 'Megosztás állapota frissítve.',
            'is_public' => $updatedPost->is_public,
        ]);
    }
    

    // public function deleteImage(DeleteImageRequest $request, Post $post)
    // {
    //     $this->postRepository->deleteImage($post);
    //     return back()->with('success', 'Kép törölve!');
    // }
}
