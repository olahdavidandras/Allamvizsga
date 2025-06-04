import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const PublicGallery = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const navigate = useNavigate();

  const fetchComments = async (postId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(`Hiba a kommentek lekérésekor (post ${postId}):`, err);
    }
  };

  const fetchPublicPosts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/public-posts', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setPosts(res.data);
      res.data.forEach(post => fetchComments(post.id));
    } catch (err) {
      console.error('Hiba a publikus posztok lekérésekor:', err);
    }
  };

  useEffect(() => {
    fetchPublicPosts();
  }, []);

  const handleAddComment = async (postId) => {
    const content = newComments[postId];
    if (!content) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/comments', { post_id: postId, content }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (err) {
      console.error('Hiba komment küldésekor:', err);
    }
  };

  return (
    <div className="public-gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">Publikus Galéria</h2>
        <div className="gallery-button-group">
          <button onClick={() => navigate('/')} className="btn btn-home">Kezdőlap</button>
          <button onClick={() => navigate('/upload')} className="btn btn-upload">Kép feltöltése</button>
          <button onClick={() => navigate('/gallery')} className="btn btn-public">Galéria</button>
          <button onClick={() => navigate('/profile')} className="btn btn-profile">Saját profil</button>
        </div>
      </div>

      <div className="public-gallery-grid">
        {posts.map(post => (
          <div key={post.id} className="public-post-card">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>

            {post.image
              ? <img src={post.image} alt={post.title} className="post-image" />
              : <p className="no-image">Nincs kép</p>
            }

            <div className="comments-section">
              <h4>Kommentek:</h4>
              {comments[post.id]?.length ? (
                <ul className="public-comment-list">
                  {comments[post.id].map(c => (
                    <li key={c.id} className="public-comment-item">
                      <img
                        src={c.user?.profile?.profile_picture || '/default-avatar.png'}
                        alt="Profilkép"
                        className="public-comment-avatar"
                      />
                      <div className="public-comment-text">
                        <strong>{c.user?.name}:</strong> {c.content}
                      </div>
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
  onChange={e => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
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

export default PublicGallery;
