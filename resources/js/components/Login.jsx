import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
const Login = ({ setUser }) => {
  const [email, setEmail] = useState('a@a.a');
  const [password, setPassword] = useState('asdasd');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loginRes = await axios.post('/login', { email, password });
      const token = loginRes.data.token;

      localStorage.setItem('token', token);

      const userRes = await axios.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({ ...userRes.data, token });
      navigate('/');
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
