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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({ ...userRes.data, token });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Hibás bejelentkezési adatok!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h2 className="text-2xl font-semibold mb-4">Bejelentkezés</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Bejelentkezés
        </button>
      </form>
    </div>
  );
};

export default Login;
