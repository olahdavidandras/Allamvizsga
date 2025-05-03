import React, { useState } from 'react';
import axios from '../axios';

const CommentSection = ({ comments, postId }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/comments', { post_id: postId, content: newComment }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      window.location.reload();
    } catch (err) {
      console.error('Hiba komment küldésekor:', err);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Hozzászólások:</h3>
      <ul className="mb-2">
        {comments.map(comment => (
          <li key={comment.id} className="border-b border-gray-200 py-1">
            <strong>{comment.user?.name || 'Anonim'}:</strong> {comment.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Írj hozzászólást..."
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Küldés
        </button>
      </form>
    </div>
  );
};

export default CommentSection;