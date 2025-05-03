import React, { useEffect, useState } from 'react';
import axios from '../axios';
import PostCard from './PostCard'; 

const Gallery = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Felhasználó lekérése sikertelen:', err);
    }
  };

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/my-posts', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setPosts(res.data);
    } catch (error) {
      console.error('Hiba a képek lekérésekor:', error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Galéria</h2>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} user={user} />)
      ) : (
        <p className="text-gray-500">Nincsenek képek megjelenítve.</p>
      )}
    </div>
  );
};

export default Gallery;
