import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Hiba kijelentkezés közben', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Képjavító Alkalmazás</h1>

      {user ? (
        <div className="text-center">
          <p className="mb-4">Szia <strong>{user.name}</strong>, be vagy jelentkezve!</p>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Kijelentkezés
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <a 
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Bejelentkezés
          </a>
          <a 
            href="/register"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Regisztráció
          </a>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
