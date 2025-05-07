<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Requests\Comment\DeleteCommentRequest;
use App\Repositories\CommentRepository;
use Illuminate\Http\JsonResponse;
use App\Models\Comment;

class CommentController extends Controller
{
    protected $commentRepository;

    public function __construct(CommentRepository $commentRepository)
    {
        $this->commentRepository = $commentRepository;
    }

    public function store(StoreCommentRequest $request): JsonResponse
    {
        $comment = $this->commentRepository->store($request->validated());

        return response()->json($comment, 201);
    }

    
    public function destroy(DeleteCommentRequest $request, Comment $comment)
    {
        $this->commentRepository->deleteComment($comment);
        return response()->json(['message' => 'Komment sikeresen törölve.']);
    }

    public function getPostComments($postId): JsonResponse
    {
        $comments = $this->commentRepository->getPostComments($postId);

        return response()->json($comments);
    }

    public function getUserComments($userId): JsonResponse
    {
        $comments = $this->commentRepository->getUserComments($userId);

        return response()->json($comments);
    }
}
