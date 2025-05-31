import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess('Sikeres regisztráció! Most már bejelentkezhetsz.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Sikertelen regisztráció!');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Regisztráció</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Név"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="Jelszó megerősítése"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="register-input"
          required
        />
        <button type="submit" className="btn btn-register">
          Regisztráció
        </button>
      </form>
    </div>
  );
};

export default Register;
