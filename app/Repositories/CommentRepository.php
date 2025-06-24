<?php

namespace App\Repositories;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

/**
 * Clasa CommentRepository gestionează operațiile de bază legate de comentarii,
 * precum adăugarea, obținerea și ștergerea acestora.
 */
class CommentRepository
{
    /**
     * Salvează un nou comentariu în baza de date.
     *
     * @param array $data Datele comentariului: post_id și content.
     * @return Comment Comentariul creat.
     */    public function store(array $data)
    {
        return Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $data['post_id'],
            'content' => $data['content'],
        ]);
    }

    /**
     * Returnează toate comentariile asociate unei postări.
     *
     * @param int $postId ID-ul postării.
     * @return \Illuminate\Database\Eloquent\Collection Lista comentariilor cu date despre utilizator.
     */
    public function getPostComments($postId)
    {
        return Comment::where('post_id', $postId)->with('user:id,name','user.profile:id,user_id,profile_picture')->get();
    }

    /**
     * Returnează toate comentariile realizate de un anumit utilizator.
     *
     * @param int $userId ID-ul utilizatorului.
     * @return \Illuminate\Database\Eloquent\Collection Lista comentariilor cu titlul postărilor.
     */
    public function getUserComments($userId)
    {
        return Comment::where('user_id', $userId)->with('post:id,title')->get();
    }

    /**
     * Șterge un comentariu existent.
     *
     * @param Comment $comment Comentariul ce trebuie șters.
     * @return bool True dacă ștergerea a fost realizată cu succes, altfel false.
     */
    public function deleteComment(Comment $comment): bool
    {
        return $comment->delete();
    }
}
