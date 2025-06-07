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
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  const fetchPosts = async () => {
    const [sort_by, order] = sortOption.split('-');
    const res = await axios.get('/my-posts', {
      headers: { Authorization: `Bearer ${token}` },
      params: { sort_by, order },
    });
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, [sortOption]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPostIndex !== null) {
        if (e.key === 'ArrowLeft') handlePrev();
        else if (e.key === 'ArrowRight') handleNext();
        else if (e.key === 'Escape') handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPostIndex]);

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

  const handleEdit = (post) => {
    const editId = post.ai_generated && post.parent_id ? post.parent_id : post.id;
    navigate(`/edit-gallery/${editId}`);
  };

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

  const handlePrev = () => {
    if (selectedPostIndex > 0) {
      const newIndex = selectedPostIndex - 1;
      setSlideDirection('left');
      setSelectedPostIndex(newIndex);
      fetchComments(posts[newIndex].id);
    }
  };

  const handleNext = () => {
    if (selectedPostIndex < posts.length - 1) {
      const newIndex = selectedPostIndex + 1;
      setSlideDirection('right');
      setSelectedPostIndex(newIndex);
      fetchComments(posts[newIndex].id);
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPostIndex(null);
      setIsClosing(false);
    }, 300);
  };

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
        <select onChange={(e) => setSortOption(e.target.value)} className="sort-dropdown">
          <option value="created_at-desc">Feltöltés (legújabb elöl)</option>
          <option value="created_at-asc">Feltöltés (legrégebbi elöl)</option>
          <option value="title-asc">Név szerint (A-Z)</option>
          <option value="title-desc">Név szerint (Z-A)</option>
        </select>
      </div>
      <div className="gallery-grid">
        {posts.map((post, index) => (
          <div key={post.id} className="post-card" onClick={() => {
            setSelectedPostIndex(index);
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
      {selectedPostIndex !== null && posts[selectedPostIndex] && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className={`modal-content ${isClosing ? 'modal-fade-out' : 'modal-fade-in'}`} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <button className="modal-nav modal-prev" onClick={handlePrev} disabled={selectedPostIndex === 0}>◀</button>
            <button className="modal-nav modal-next" onClick={handleNext} disabled={selectedPostIndex === posts.length - 1}>▶</button>
            <img key={posts[selectedPostIndex].id} src={posts[selectedPostIndex].image} alt={posts[selectedPostIndex].title} className={`modal-image slide-${slideDirection}`} onAnimationEnd={() => setSlideDirection('')} />
            <h3>{posts[selectedPostIndex].title}</h3>
            <p>{posts[selectedPostIndex].content}</p>
            <button className="btn btn-edit" onClick={() => handleEdit(posts[selectedPostIndex])}>Szerkesztés</button>
            <h4>Kommentek:</h4>
            {comments[posts[selectedPostIndex].id]?.length ? (
              <ul className="comment-list">
                {comments[posts[selectedPostIndex].id].map((c) => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-main">
                      {c.user?.profile?.profile_picture ? (
                        <img src={c.user.profile.profile_picture} alt={c.user.name} className="comment-avatar" />
                      ) : (
                        <div className="comment-avatar fallback">
                          {c.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <div className="comment-text">
                        <strong className="comment-line">{c.user?.name}:</strong>
                        <span className="comment-line">{c.content}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteComment(c.id, posts[selectedPostIndex].id)} className="comment-delete-button">Törlés</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nincsenek kommentek.</p>
            )}
            <div className="new-comment-form">
              <input type="text" placeholder="Új komment..." value={newComments[posts[selectedPostIndex].id] || ''} onChange={(e) => setNewComments(prev => ({ ...prev, [posts[selectedPostIndex].id]: e.target.value }))} className="new-comment-input" />
              <button onClick={() => handleAddComment(posts[selectedPostIndex].id)} className="btn btn-comment">Küldés</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
