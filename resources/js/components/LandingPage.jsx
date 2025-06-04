import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const LandingPage = ({ user, setUser }) => {
  const navigate = useNavigate();

  /**
   * Funcție de deconectare a utilizatorului.
   * Trimite o solicitare POST către endpoint-ul /logout și curăță tokenul din localStorage.
   */
  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.post('/logout', null, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      localStorage.removeItem('token');
      setUser(null); // Resetare stare utilizator
      navigate('/'); // Redirecționare spre pagina principală
    } catch (error) {
      console.error('Hiba kijelentkezés közben:', error);
    }
  };

  return (
    <div className="landing-container">
      <h1 className="title">Képjavító Alkalmazás</h1>

      {user ? (
        // Afișează opțiuni dacă utilizatorul este autentificat
        <div className="user-info">
          <p>Szia <strong>{user.name}</strong>, be vagy jelentkezve!</p>
          <div className="button-group">
            <button
              onClick={() => navigate('/gallery')}
              className="btn btn-gallery"
            >
              Galéria
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-logout"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      ) : (
        // Afișează butoane pentru logare sau înregistrare dacă utilizatorul nu este autentificat
        <div className="button-group">
          <a href="/login" className="btn btn-login">Bejelentkezés</a>
          <a href="/register" className="btn btn-register">Regisztráció</a>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
