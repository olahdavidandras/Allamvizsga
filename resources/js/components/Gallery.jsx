import React, { useEffect, useState } from 'react';
import axios from '../axios';

const Gallery = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/my-posts', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log("Kapott posztok:", res.data);
      setPosts(res.data);
    } catch (error) {
      console.error('Hiba a képek lekérésekor:', error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Galéria</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.isArray(posts) && posts.map((post) => (
          <div key={post.id} className="border rounded p-2 bg-white shadow">
            <h3 className="font-semibold">{post.title}</h3>
            {post.image ? (
              <img src={post.image} alt={post.title} className="w-full h-auto mt-2 rounded" />
            ) : (
              <p>Nincs kép</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
