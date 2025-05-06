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

  const fetchComments = async (postId) => {
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

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/my-posts', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setPosts(res.data);
      res.data.forEach(post => fetchComments(post.id));
    } catch (error) {
      console.error('Hiba a képek lekérésekor:', error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddComment = async (postId) => {
    const content = newComments[postId];
    if (!content) return;

    try {
      await axios.post('/comments', { post_id: postId, content }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (err) {
      console.error('Hiba komment küldéskor:', err);
    }
  };

  const handleEnhance = async (postId, apiType) => {
    setLoading(prev => ({ ...prev, [postId]: apiType }));
    try {
      const res = await axios.post('/enhance', {
        image_id: postId,
        api_type: apiType,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const predictionId = res.data.prediction_id;
      await checkStatus(predictionId, postId);
    } catch (err) {
      console.error(`Hiba az ${apiType} feldolgozáskor:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const checkStatus = async (predictionId, postId) => {
    try {
      const res = await axios.post('/check-status', {
        prediction_id: predictionId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
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
    setEditMode(post.id);
    setEditedPost({ title: post.title, content: post.content });
  };

  const handleUpdate = async (postId) => {
    try {
      await axios.put(`/post/${postId}`, editedPost, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      fetchPosts();
    } catch (err) {
      console.error('Hiba a törlés során:', err);
    }
  };

  const handleTogglePublic = async (postId) => {
    try {
      await axios.post('/toggle-public', { post_id: postId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      fetchPosts();
    } catch (err) {
      console.error('Hiba a megosztás módosításakor:', err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Galéria</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/upload')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Kép feltöltése
          </button>
          <button
            onClick={() => navigate('/public-gallery')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Publikus galéria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded p-4 bg-white shadow">
            {editMode === post.id ? (
              <div className="mb-2">
                <input
                  value={editedPost.title}
                  onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                  className="w-full mb-1 border px-2 py-1 rounded"
                />
                <textarea
                  value={editedPost.content}
                  onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                  className="w-full mb-2 border px-2 py-1 rounded"
                />
                <button onClick={() => handleUpdate(post.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Mentés</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{post.content}</p>
              </>
            )}

            {post.image ? (
              <img src={post.image} alt={post.title} className="w-full h-auto mb-3 rounded" />
            ) : (
              <p className="text-red-500">Nincs kép</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => handleEnhance(post.id, 'gfpgan')} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                {loading[post.id] === 'gfpgan' ? 'Feldolgozás...' : 'GFPGAN javítás'}
              </button>
              <button onClick={() => handleEnhance(post.id, 'ddcolor')} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                {loading[post.id] === 'ddcolor' ? 'Feldolgozás...' : 'DDColor színezés'}
              </button>
              <button onClick={() => handleEdit(post)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Szerkesztés</button>
              <button onClick={() => handleDelete(post.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Törlés</button>
              <button onClick={() => handleTogglePublic(post.id)} className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">
                {post.is_public ? 'Megosztás megszüntetése' : 'Megosztás'}
              </button>
            </div>

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

export default Gallery;
