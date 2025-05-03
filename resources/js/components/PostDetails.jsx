import React, { useEffect, useState } from 'react';
import axios from '../axios';

const PostCard = ({ post, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/posts/${post.id}/comments`);
        setComments(res.data);
      } catch (err) {
        setError('Nem sikerült a kommentek betöltése.');
      }
    };

    fetchComments();
  }, [post.id]);

  const handleComment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        '/comments',
        {
          post_id: post.id,
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const res = await axios.get(`/posts/${post.id}/comments`);
      setComments(res.data);
      setNewComment('');
      setSuccess('Hozzászólás elküldve!');
    } catch (err) {
      setError('Hiba a hozzászólás mentésekor.');
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <img src={post.image} alt={post.title} className="w-full rounded mb-3" />
      <h2 className="text-xl font-bold mb-1">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>

      <h3 className="font-semibold mb-2">Hozzászólások:</h3>
      {comments.length === 0 ? (
        <p>Még nincs hozzászólás.</p>
      ) : (
        <ul className="space-y-1 mb-3">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm border-b pb-1">
              <strong>{comment.user?.name || 'Névtelen'}:</strong> {comment.content}
            </li>
          ))}
        </ul>
      )}

      {user && (
        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border rounded p-2"
            rows="2"
            placeholder="Írj hozzászólást..."
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Hozzászólás küldése
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
        </form>
      )}
    </div>
  );
};

export default PostCard;
