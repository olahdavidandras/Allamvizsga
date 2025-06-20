import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const PublicGallery = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
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
      console.error(`Eroare la încărcarea comentariilor (post ${postId}):`, err);
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
      console.error('Eroare la încărcarea postărilor publice:', err);
    }
  };

  useEffect(() => {
    fetchPublicPosts();
  }, []);

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
      console.error('Eroare la trimiterea comentariului:', err);
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
        <h2 className="gallery-title">Publikus Galéria</h2>
        <div className="gallery-button-group">
          <button onClick={() => navigate('/')} className="btn btn-home">Kezdőlap</button>
          <button onClick={() => navigate('/upload')} className="btn btn-upload">Kép feltöltése</button>
          <button onClick={() => navigate('/gallery')} className="btn btn-public">Galéria</button>
          <button onClick={() => navigate('/profile')} className="btn btn-profile">Saját profil</button>
        </div>
      </div>

      <div className="gallery-grid">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`post-card ${hoveredPostId === post.id ? 'hovered' : ''}`}
            onMouseEnter={() => {
              const timer = setTimeout(() => {
                setHoveredPostId(post.id);
              }, 1000);
              setHoverTimer(timer);
            }}
            onMouseLeave={() => {
              clearTimeout(hoverTimer);
              setHoveredPostId(null);
            }}
            onClick={() => {
              setSelectedPostIndex(index);
              fetchComments(post.id);
            }}
          >
            {post.image ? (
              <>
                <img src={post.image} alt={post.title} className="post-image" />
                {hoveredPostId === post.id && (
                  <div className="post-hover-info">
                    <strong>{post.title}</strong>
                    <br />
                    <em>{new Date(post.created_at).toLocaleString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}</em>
                  </div>
                )}
              </>
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
            <img
              key={posts[selectedPostIndex].id}
              src={posts[selectedPostIndex].image}
              alt={posts[selectedPostIndex].title}
              className={`modal-image slide-${slideDirection}`}
              onAnimationEnd={() => setSlideDirection('')}
            />
            <h3>{posts[selectedPostIndex].title}</h3>
            <div className="post-meta-row">
              <em className="post-date">
                {new Date(posts[selectedPostIndex].created_at).toLocaleString('hu-HU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </em>
              <strong className="image-type-label">
                {posts[selectedPostIndex].ai_generated
                  ? posts[selectedPostIndex].ai_type === 'ddcolor'
                    ? 'Színezett (DDColor)'
                    : posts[selectedPostIndex].ai_type === 'gfpgan'
                      ? 'Feljavított (GFPGAN)'
                      : 'AI által generált'
                  : 'Eredeti kép'}
              </strong>
            </div>
            <p>{posts[selectedPostIndex].content}</p>
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
                value={newComments[posts[selectedPostIndex].id] || ''}
                onChange={(e) => setNewComments(prev => ({ ...prev, [posts[selectedPostIndex].id]: e.target.value }))}
                className="new-comment-input"
              />
              <button onClick={() => handleAddComment(posts[selectedPostIndex].id)} className="btn btn-comment">Küldés</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicGallery;
