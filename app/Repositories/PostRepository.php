<?php

namespace App\Repositories;

use App\Models\Post;

/**
 * Clasa PostRepository gestionează operațiile de bază pentru modelul Post,
 * inclusiv crearea, actualizarea, ștergerea și gestionarea imaginilor și stării de publicare.
 */
class PostRepository
{
    /**
     * Returnează toate postările din baza de date.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllPosts()
    {
        return Post::all();
    }

    /**
     * Creează o nouă postare pe baza datelor furnizate.
     *
     * @param array $data
     * @return \App\Models\Post
     */
    public function createPost(array $data)
    {
        return Post::create($data);
    }

    /**
     * Adaugă o imagine la o postare existentă folosind MediaLibrary.
     *
     * @param Post $post
     * @param mixed $image
     * @return \Spatie\MediaLibrary\MediaCollections\Models\Media
     */
    public function addImage(Post $post, $image)
    {
        return $post->addMedia($image)->toMediaCollection('images');
    }

    /**
     * Șterge imaginea asociată postării (dacă există).
     *
     * @param Post $post
     * @return void
     */
    public function deleteImage(Post $post)
    {
        if ($post->getFirstMedia('images')) {
            $post->clearMediaCollection('images');
        }
    }

    /**
     * Actualizează o postare existentă cu datele noi.
     *
     * @param Post $post
     * @param array $data
     * @return Post
     */
    public function updatePost(Post $post, array $data)
    {
        $post->update($data);
        return $post;
    }

    /**
     * Șterge definitiv o postare.
     *
     * @param Post $post
     * @return void
     */
    public function deletePost(Post $post)
    {
        $post->delete();
    }

    /**
     * Inversează starea de public/privat a unei postări.
     *
     * @param Post $post
     * @return Post
     */
    public function togglePublic(Post $post)
    {
        $post->is_public = !$post->is_public;
        $post->save();
        return $post;
    }

    /**
     * Returnează toate postările publice cu imaginile aferente.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPublicPosts()
    {
        return Post::where('is_public', true)->with('media')->latest()->get();
    }

    /**
     * Returnează postările unui utilizator sortate după câmpul selectat.
     *
     * @param int $userId
     * @param string $sortField
     * @param string $sortOrder
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserPostsSorted($userId, $sortField = 'created_at', $sortOrder = 'desc')
    {
        $allowedFields = ['title', 'created_at'];
        $allowedOrder = ['asc', 'desc'];

        if (!in_array($sortField, $allowedFields)) {
            $sortField = 'created_at';
        }

        if (!in_array($sortOrder, $allowedOrder)) {
            $sortOrder = 'desc';
        }

        return Post::where('user_id', $userId)
            ->where('visible_in_gallery', true)
            ->orderBy($sortField, $sortOrder)
            ->with('media')
            ->get();
    }

    /**
     * Returnează postarea cu versiunile AI aferente dacă utilizatorul este proprietar.
     *
     * @param int $postId
     * @param int $userId
     * @return array
     */
    public function getPostWithVariants($postId, $userId)
    {
        $post = Post::with('aiVersions')->findOrFail($postId);

        if ($post->user_id !== $userId) {
            abort(403, 'Nincs jogosultság');
        }

        return [
            'post' => $post,
            'ai_versions' => $post->aiVersions
        ];
    }

    /**
     * Actualizează starea de vizibilitate în galerie pentru o postare și versiunile AI.
     *
     * @param int $postId
     * @param array $visibleIds
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateVisibility($postId, array $visibleIds, $userId)
    {
        $mainPost = Post::findOrFail($postId);

        if ($mainPost->user_id !== $userId) {
            abort(403, 'Nincs jogosultság');
        }

        Post::where('parent_id', $mainPost->id)->update(['visible_in_gallery' => false]);
        Post::whereIn('id', $visibleIds)->update(['visible_in_gallery' => true]);

        $mainPost->visible_in_gallery = in_array($mainPost->id, $visibleIds);
        $mainPost->save();

        return response()->json(['message' => 'Galéria láthatóság frissítve.']);
    }

    /**
 * Returnează postările utilizatorului curent sortate, doar cele vizibile în galerie.
 *
 * @param \App\Models\User $user
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function getMyPosts($user, $request)
{
    $sortBy = $request->get('sort_by', 'created_at');
    $order = $request->get('order', 'desc');

    $validSorts = ['title', 'created_at'];
    $validOrders = ['asc', 'desc'];

    if (!in_array($sortBy, $validSorts)) {
        $sortBy = 'created_at';
    }

    if (!in_array($order, $validOrders)) {
        $order = 'desc';
    }

    $posts = $user->posts()
        ->where('visible_in_gallery', true)
        ->with('media')
        ->orderBy($sortBy, $order)
        ->get();

    return response()->json($posts);
}

}
