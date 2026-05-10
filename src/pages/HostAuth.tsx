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

    setTimeout(() => {
      if (password === HOST_PASSWORD) {
        localStorage.setItem('hostAuthorized', 'true');
        navigate('/host-choice');
      } else {
        setError('❌ Wrong password');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="host-auth">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        <div className="auth-card">
          <h1>👑 Host Login</h1>
          <p className="description">Enter the host password to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
              {isLoading ? '⏳ Checking...' : '✓ Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
