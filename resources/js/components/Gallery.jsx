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
  const [sortOption, setSortOption] = useState('created_at-desc');
  const [selectedPost, setSelectedPost] = useState(null);
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
    const [sort_by, order] = sortOption.split('-');
    const res = await axios.get('/my-posts', {
      headers: { Authorization: `Bearer ${token}` },
      params: { sort_by, order },
    });
    setPosts(res.data);
  };


  // Efect care se execută la montarea componentei
  useEffect(() => {
    fetchPosts();
  }, [sortOption]);

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

      <div className="sort-dropdown">
        <label htmlFor="sortSelect">Rendezés:</label>
        <select
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-dropdown"
        >
          <option value="created_at-desc">Feltöltés (legújabb elöl)</option>
          <option value="created_at-asc">Feltöltés (legrégebbi elöl)</option>
          <option value="title-asc">Név szerint (A-Z)</option>
          <option value="title-desc">Név szerint (Z-A)</option>
        </select>
      </div>

      <div className="gallery-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card" onClick={() => {
            setSelectedPost(post);
            fetchComments(post.id);
          }}>
            {post.image ? (
              <img src={post.image} alt={post.title} className="post-image" />
            ) : (
              <p className="no-image">Nincs kép</p>
            )}
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>×</button>
            <img src={selectedPost.image} alt={selectedPost.title} className="modal-image" />
            <h3>{selectedPost.title}</h3>
            <p>{selectedPost.content}</p>
            <button className="btn btn-edit" onClick={() => navigate(`/edit/${selectedPost.id}`)}>Szerkesztés</button>

            <h4>Kommentek:</h4>
            {comments[selectedPost.id]?.length ? (
              <ul className="comment-list">
                {comments[selectedPost.id].map((c) => (
                  <li key={c.id} className="comment-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #ddd',
                    padding: '8px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {c.user?.profile?.profile_picture ? (
                        <img
                          src={c.user.profile.profile_picture}
                          alt={c.user.name}
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: '#ccc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#333'
                        }}>
                          {c.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{c.user?.name}:</strong>
                        <span style={{ fontSize: '0.9rem' }}>{c.content}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteComment(c.id, selectedPost.id)} className="comment-delete-button">
                      Törlés
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nincsenek kommentek.</p>
            )}

            <div className="new-comment-form">
              <input
                type="text"
                placeholder="Új komment..."
                value={newComments[selectedPost.id] || ''}
                onChange={(e) => setNewComments(prev => ({ ...prev, [selectedPost.id]: e.target.value }))}
                className="new-comment-input"
              />
              <button
                onClick={() => handleAddComment(selectedPost.id)}
                className="btn btn-comment"
              >
                Küldés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
