import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
const Login = ({ setUser }) => {
  // Stări locale pentru email, parolă și mesaj de eroare
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Funcție apelată la trimiterea formularului.
   * Trimite o solicitare POST la API pentru autentificare și salvează tokenul primit.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Trimite datele de logare către server
      const loginRes = await axios.post('/login', { email, password });
      const token = loginRes.data.token;

      // Salvează tokenul în localStorage
      localStorage.setItem('token', token);

      // Solicită datele utilizatorului autentificat
      const userRes = await axios.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualizează starea utilizatorului la nivel de aplicație
      setUser({ ...userRes.data, token });
      navigate('/'); // Redirecționează către pagina principală
    } catch (err) {
      console.error(err);
      setError('Hibás bejelentkezési adatok!');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Bejelentkezés</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="btn btn-login">
          Bejelentkezés
        </button>
      </form>
    </div>
  );
};

export default Login;
