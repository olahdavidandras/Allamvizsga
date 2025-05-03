import React, { useEffect, useState } from 'react';
import CommentSection from './CommentSection';
import axios from '../axios';

const PostCard = ({ post }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/posts/${post.id}/comments`);
        setComments(res.data);
      } catch (error) {
        console.error('Kommentek lekérése sikertelen:', error);
      }
    };

    fetchComments();
  }, [post.id]);

  return (
    <div className="bg-white rounded shadow p-4">
      <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded" />
      <h2 className="text-xl font-bold mt-2">{post.title}</h2>
      <p className="text-gray-600">{post.content}</p>
      <CommentSection comments={comments} postId={post.id} />
    </div>
  );
};

export default PostCard;