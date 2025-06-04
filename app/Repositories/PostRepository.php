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
     * @param array $data Datele necesare pentru crearea unei postări (titlu, conținut, user_id etc.)
     * @return \App\Models\Post
     */
    public function createPost($data)
    {
        return Post::create($data);
    }

    /**
     * Adaugă o imagine la o postare existentă, folosind Media Library.
     *
     * @param \App\Models\Post $post Postarea la care se adaugă imaginea.
     * @param mixed $image Fișierul de imagine încărcat.
     * @return \Spatie\MediaLibrary\MediaCollections\Models\Media
     */
    public function addImage($post, $image)
    {
        return $post->addMedia($image)->toMediaCollection('images');
    }

    /**
     * Șterge prima imagine asociată postării, dacă există.
     *
     * @param \App\Models\Post $post Postarea vizată.
     * @return void
     */
    public function deleteImage($post)
    {
        if ($post->getFirstMedia('images')) {
            $post->clearMediaCollection('images');
        }
    }

     /**
     * Actualizează datele unei postări existente.
     *
     * @param \App\Models\Post $post Postarea ce urmează a fi actualizată.
     * @param array $data Noile date pentru actualizare.
     * @return \App\Models\Post
     */
    public function updatePost(Post $post, array $data)
    {
        $post->update($data);
        return $post;
    }

    /**
     * Șterge complet o postare din baza de date.
     *
     * @param \App\Models\Post $post Postarea ce trebuie ștearsă.
     * @return void
     */
    public function deletePost(Post $post)
    {
        $post->delete();
    }

    /**
     * Inversează starea de publicare a unei postări (privat ↔ public).
     *
     * @param \App\Models\Post $post Postarea vizată.
     * @return \App\Models\Post Postarea actualizată.
     */
    public function togglePublic(Post $post)
    {
        $post->is_public = !$post->is_public;
        $post->save();
        return $post;
    }

     /**
     * Returnează toate postările marcate ca publice, împreună cu imaginile aferente.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPublicPosts()
    {
        return Post::where('is_public', true)->with('media')->latest()->get();
    }

}