<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Requests\Comment\DeleteCommentRequest;
use App\Repositories\CommentRepository;
use Illuminate\Http\JsonResponse;
use App\Models\Comment;

class CommentController extends Controller
{
    /**
     * @var CommentRepository
     * Repository responsabil pentru operații legate de comentarii.
     */
    protected $commentRepository;

    /**
     * Constructorul clasei. Inițializează repository-ul de comentarii.
     *
     * @param CommentRepository $commentRepository
     */
    public function __construct(CommentRepository $commentRepository)
    {
        $this->commentRepository = $commentRepository;
    }

    /**
     * Salvează un comentariu nou în baza de date, pe baza datelor validate.
     *
     * @param StoreCommentRequest $request
     * @return JsonResponse
     */
    public function store(StoreCommentRequest $request): JsonResponse
    {
        // Creează comentariul folosind repository-ul
        $comment = $this->commentRepository->store($request->validated());

        // Returnează comentariul creat cu codul HTTP 201
        return response()->json($comment, 201);
    }

    /**
     * Șterge un comentariu existent, în baza permisiunilor validate.
     *
     * @param DeleteCommentRequest $request
     * @param Comment $comment
     * @return JsonResponse
     */
    public function destroy(DeleteCommentRequest $request, Comment $comment)
    {
        $this->commentRepository->deleteComment($comment);
        return response()->json(['message' => 'Komment sikeresen törölve.']);
    }

    /**
     * Returnează lista comentariilor asociate unui anumit post.
     *
     * @param int $postId
     * @return JsonResponse
     */
    public function getPostComments($postId): JsonResponse
    {
        $comments = Comment::where('post_id', $postId)
            ->with(['user.profile'])
            ->latest()
            ->get();

        return response()->json($comments);
    }

    /**
     * Returnează comentariile postate de un anumit utilizator.
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function getUserComments($userId): JsonResponse
    {
        $comments = Comment::where('user_id', $userId)
            ->with(['user.profile'])
            ->latest()
            ->get();

        return response()->json($comments);
    }
}
