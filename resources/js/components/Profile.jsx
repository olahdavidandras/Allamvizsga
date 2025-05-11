import React, { useEffect, useState } from 'react';
import axios from '../axios';

const Profile = () => {
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');             
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        setBio(res.data.bio || '');
        setWebsite(res.data.website || '');               
        setPreviewImage(res.data.profile_picture || null);
      } catch (err) {
        console.error('Hiba a profil betöltésekor:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('website', website);                 
    if (selectedFile instanceof File) {
      formData.append('profile_picture', selectedFile);
    }

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('/profile-update', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setMessage('Profil sikeresen frissítve!');
      if (res.data.profile_picture) {
        setPreviewImage(res.data.profile_picture);
      }
      if (res.data.website) {
        setWebsite(res.data.website);
      }
    } catch (err) {
      console.error('Hiba a profil mentésekor:', err.response || err);
      setMessage('Hiba a frissítés során.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profil szerkesztése</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {previewImage && (
        <div className="mb-4">
          <p className="font-medium">Jelenlegi profilkép:</p>
          <img
            src={previewImage}
            alt="Profilkép"
            className="w-32 h-32 rounded-full object-cover mt-2"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Bemutatkozás</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded p-2"
            rows="4"
          ></textarea>
        </div>

        <div>
          <label className="block font-medium">Weboldal</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://példa.hu"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium">Profilkép feltöltése</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Mentés
        </button>
      </form>
    </div>
  );
};

export default Profile;
