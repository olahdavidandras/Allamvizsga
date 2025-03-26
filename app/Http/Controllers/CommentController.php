<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
            'content' => $request->content,
        ]);

        return response()->json($comment, 201);
    }

    public function getPostComments($postId) {
        $comments = Comment::where('post_id', $postId)->with('user:id,name')->get();
        return response()->json($comments);
    }

    public function getUserComments($userId) {
        $comments = Comment::where('user_id', $userId)->with('post:id,title')->get();
        return response()->json($comments);
    }
}

