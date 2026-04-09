import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HostAuth.css';

const HOST_PASSWORD = '7250mafia!';

export const HostAuth: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Имитируем проверку пароля
    setTimeout(() => {
      if (password === HOST_PASSWORD) {
        localStorage.setItem('hostAuthorized', 'true');
        navigate('/host-editor');
      } else {
        setError('❌ Неверный пароль');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="host-auth">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Назад
        </button>

        <div className="auth-card">
          <h1>👑 Вход Ведущего</h1>
          <p className="description">Введите пароль ведущего, чтобы продолжить</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !password}
            >
              {isLoading ? '⏳ Проверка...' : '✓ Вход'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
