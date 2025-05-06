import React, { useEffect, useState } from 'react';
import axios from '../axios';

const PublicGallery = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Publikus Galéria</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded p-4 bg-white shadow">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{post.content}</p>

            {post.image ? (
              <img src={post.image} alt={post.title} className="w-full h-auto mb-3 rounded" />
            ) : (
              <p className="text-red-500">Nincs kép</p>
            )}

            <h4 className="text-md font-medium mb-1">Kommentek:</h4>
            {comments[post.id]?.length ? (
              <ul className="mb-2">
                {comments[post.id].map((c) => (
                  <li key={c.id} className="text-sm text-gray-800 border-b py-1">
                    <strong>{c.user?.name}:</strong> {c.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nincsenek kommentek.</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Új komment..."
                value={newComments[post.id] || ''}
                onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="bg-gray-800 text-white text-sm px-3 py-1 rounded hover:bg-gray-900"
              >
                Küldés
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicGallery;
