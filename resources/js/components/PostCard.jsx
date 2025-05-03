import React, { useEffect, useState } from 'react';
import axios from '../axios';

const PostCard = ({ post, user }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/posts/${post.id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setComments(res.data);
    } catch (err) {
      console.error('Kommentek lekérése sikertelen:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        '/comments',
        {
          post_id: post.id,
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      setComment('');
      fetchComments();
    } catch (err) {
      console.error('Hiba komment küldésekor:', err);
    }
  };

  return (
    <div className="border rounded p-4 mb-6 bg-white shadow">
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      {post.image ? (
        <img src={post.image} alt={post.title} className="w-full h-auto mb-2 rounded" />
      ) : (
        <p className="text-gray-600">Nincs kép</p>
      )}
      <p className="mb-4">{post.content}</p>

      <div>
        <h4 className="font-semibold mb-2">Hozzászólások:</h4>
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="mb-2 p-2 bg-gray-100 rounded">
              <p className="text-sm font-semibold">{c.user?.name || 'Ismeretlen'}:</p>
              <p>{c.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Még nincsenek hozzászólások.</p>
        )}

        {user && (
          <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Írj hozzászólást..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border p-2 flex-1 rounded"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Küldés
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostCard;
