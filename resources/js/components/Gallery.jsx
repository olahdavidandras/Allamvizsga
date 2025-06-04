import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Gallery = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [loading, setLoading] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [editedPost, setEditedPost] = useState({ title: '', content: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  
  /**
   * Obține comentariile asociate unei postări
   */
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(`Hiba a kommentek lekérésekor (post ${postId}):`, err);
    }
  };

  /**
   * Obține toate postările utilizatorului și comentariile aferente
   */
  const fetchPosts = async () => {
    try {
      const res = await axios.get('/my-posts', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setPosts(res.data);
      res.data.forEach(post => fetchComments(post.id));
    } catch (err) {
      console.error('Hiba a képek lekérésekor:', err);
      setPosts([]);
    }
  };

  // Efect care se execută la montarea componentei
  useEffect(() => { fetchPosts(); }, []);

  /**
   * Adaugă un comentariu nou la o postare
   */
  const handleAddComment = async (postId) => {
    const content = newComments[postId];
    if (!content) return;
    try {
      await axios.post('/comments', { post_id: postId, content }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (err) {
      console.error('Hiba komment küldéskor:', err);
    }
  };

  /**
   * Șterge un comentariu după ID
   */
  const handleDeleteComment = async (commentId, postId) => {
    try {
      await axios.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      fetchComments(postId);
    } catch (err) {
      console.error('Hiba a komment törlésekor:', err);
    }
  };

  /**
   * Trimite o imagine pentru îmbunătățire AI (GFPGAN sau DDColor)
   */
  const handleEnhance = async (postId, apiType) => {
    setLoading(prev => ({ ...prev, [postId]: apiType }));
    try {
      const res = await axios.post('/enhance', { image_id: postId, api_type: apiType }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      await checkStatus(res.data.prediction_id, postId);
    } catch (err) {
      console.error(`Hiba az ${apiType} feldolgozáskor:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  /**
   * Verifică statusul procesării AI
   */
  const checkStatus = async (predictionId, postId) => {
    try {
      const res = await axios.post('/check-status', { prediction_id: predictionId }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.data.status === 'processing') {
        setTimeout(() => checkStatus(predictionId, postId), 3000);
      } else if (res.data.image_url) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Hiba a státusz lekérdezésnél:', err);
    }
  };

  /**
   * Activează modul de editare pentru o postare
   */
  const handleEdit = (post) => {
    setEditMode(post.id);
    setEditedPost({ title: post.title, content: post.content });
  };

  /**
   * Salvează modificările unei postări
   */
  const handleUpdate = async (postId) => {
    try {
      await axios.put(`/post/${postId}`, editedPost, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setEditMode(null);
      fetchPosts();
    } catch (err) {
      console.error('Hiba a módosítás során:', err);
    }
  };

  /**
   * Șterge o postare
   */
  const handleDelete = async (postId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a képet?')) return;
    try {
      await axios.delete(`/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      fetchPosts();
    } catch (err) {
      console.error('Hiba a törlés során:', err);
    }
  };

  
  /**
   * Comută starea publică a unei postări
   */
  const handleTogglePublic = async (postId) => {
    try {
      await axios.post('/toggle-public', { post_id: postId }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      fetchPosts();
    } catch (err) {
      console.error('Hiba a megosztás módosításakor:', err);
    }
  };

  /**
   * Interfața principală de afișare a postărilor, imaginilor, comentariilor și acțiunilor
   */
  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">Galéria</h2>
        <div className="gallery-button-group">
          <button onClick={() => navigate('/')} className="btn btn-home">Kezdőlap</button>
          <button onClick={() => navigate('/upload')} className="btn btn-upload">Kép feltöltése</button>
          <button onClick={() => navigate('/public-gallery')} className="btn btn-public">Publikus galéria</button>
          <button onClick={() => navigate('/profile')} className="btn btn-profile">Saját profil</button>
        </div>
      </div>

      <div className="gallery-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            {editMode === post.id ? (
              <div className="edit-section">
                <input
                  value={editedPost.title}
                  onChange={(e) => setEditedPost(prev => ({ ...prev, title: e.target.value }))}
                  className="edit-input"
                />
                <textarea
                  value={editedPost.content}
                  onChange={(e) => setEditedPost(prev => ({ ...prev, content: e.target.value }))}
                  className="edit-textarea"
                />
                <button onClick={() => handleUpdate(post.id)} className="btn btn-save">Mentés</button>
              </div>
            ) : (
              <>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>
              </>
            )}

            {post.image ? (
              <img src={post.image} alt={post.title} className="post-image" />
            ) : (
              <p className="no-image">Nincs kép</p>
            )}

            <div className="post-actions">
              <button
                onClick={() => handleEnhance(post.id, 'gfpgan')}
                className="action-button btn-enhance-gfpgan"
              >
                {loading[post.id] === 'gfpgan' ? 'Feldolgozás...' : 'GFPGAN javítás'}
              </button>
              <button
                onClick={() => handleEnhance(post.id, 'ddcolor')}
                className="action-button btn-enhance-ddcolor"
              >
                {loading[post.id] === 'ddcolor' ? 'Feldolgozás...' : 'DDColor színezés'}
              </button>
              <button onClick={() => handleEdit(post)} className="action-button btn-edit">Szerkesztés</button>
              <button onClick={() => handleDelete(post.id)} className="action-button btn-delete">Törlés</button>
              <button onClick={() => handleTogglePublic(post.id)} className="action-button btn-toggle">
                {post.is_public ? 'Megosztás megszüntetése' : 'Megosztás'}
              </button>
            </div>

            <div className="comments-section">
              <h4>Kommentek:</h4>
                {comments[post.id]?.length ? (
                <ul className="comment-list">
                {comments[post.id].map((c) => (
                <li key={c.id} className="comment-item">
                  <div className="comment-header">
                  {c.user?.profile?.profile_picture ? (
                    <img
                    src={c.user.profile.profile_picture}
                    alt={c.user.name}
                    className="comment-avatar"
            />
          ) : (
            <div className="comment-avatar placeholder-avatar">
              {c.user?.name?.[0] ?? '?'}
            </div>
          )}
          <span className="comment-text">
            <strong>{c.user?.name}:</strong> {c.content}
          </span>
        </div>
        <button
          onClick={() => handleDeleteComment(c.id, post.id)}
          className="comment-delete-button"
        >
          Törlés
        </button>
      </li>
    ))}
  </ul>
) : (
  <p className="no-comments">Nincsenek kommentek.</p>
)}


              <div className="new-comment-form">
                <input
                  type="text"
                  placeholder="Új komment..."
                  value={newComments[post.id] || ''}
                  onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                  className="new-comment-input"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="btn btn-comment"
                >
                  Küldés
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
