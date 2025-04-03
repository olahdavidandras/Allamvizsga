<?php

namespace App\Repositories;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentRepository
{
    public function store(array $data)
    {
        return Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $data['post_id'],
            'content' => $data['content'],
        ]);
    }

    public function getPostComments($postId)
    {
        return Comment::where('post_id', $postId)->with('user:id,name')->get();
    }

    public function getUserComments($userId)
    {
        return Comment::where('user_id', $userId)->with('post:id,title')->get();
    }
}
