import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  // Inițializare stări locale pentru biografie, website, imagine și mesaje
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');
    const navigate = useNavigate();
  
  /**
   * La montarea componentei, se solicită datele profilului curent de la API.
   * Tokenul de autentificare este extras din localStorage.
   */
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
        // Se setează datele profilului în stările componentei
        setBio(res.data.bio || '');
        setWebsite(res.data.website || '');
        setPreviewImage(res.data.profile_picture || null);
      } catch (err) {
        console.error('Hiba a profil betöltésekor:', err);
      }
    };
    fetchProfile(); // Apelează funcția imediat după randare
  }, []);

  /**
   * Funcția care trimite cererea de actualizare a profilului.
   * Se construiește un obiect FormData cu biografia, website-ul și imaginea selectată.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('website', website);
    if (selectedFile) {
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
      // Mesaj de succes și actualizare imagine/website în caz de răspuns valid
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
    <div className="profile-container">
      <div className="gallery-button-group">
          <button onClick={() => navigate('/gallery')} className="btn btn-public">Vissza</button>
        </div>
      <h2 className="profile-title">Profil szerkesztése</h2>
      {message && <p className="message-success">{message}</p>}

      {previewImage && (
        <div className="current-image">
          <p>Jelenlegi profilkép:</p>
          <img src={previewImage} alt="Profilkép" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Bemutatkozás</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="form-input"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Weboldal</label>
          <input
            type="url"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            placeholder="https://példa.hu"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Profilkép feltöltése</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setSelectedFile(e.target.files[0])}
            className="form-input"
          />
        </div>

        <button type="submit" className="btn btn-save">
          Mentés
        </button>
      </form>
    </div>
  );
};

export default Profile;
