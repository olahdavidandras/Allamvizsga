import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const UploadImage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  /**
   * La trimiterea formularului, se creează un obiect FormData care conține
   * informațiile introduse și fișierul selectat. Se trimite cererea POST
   * către backend cu token-ul Bearer pentru autentificare.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image);

    try {
      await axios.post('/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // La succes, se afișează mesajul și se redirecționează către galerie
      setSuccess('Kép sikeresen feltöltve!');
      setTimeout(() => navigate('/gallery'), 2000);
    } catch (err) {
      console.error(err);
      setError('Hiba a kép feltöltése során!');
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Képfeltöltés</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Cím"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="upload-input"
          required
        />
        <textarea
          placeholder="Leírás"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="upload-textarea"
          required
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="upload-input"
          required
        />
        <button type="submit" className="btn btn-submit">
          Feltöltés
        </button>
      </form>
    </div>
  );
};

export default UploadImage;
