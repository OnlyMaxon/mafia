import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="container">
        <header className="header">
          <h1>🎭 MAFIA GAME</h1>
          <p className="subtitle">Play online with your friends</p>
        </header>

        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/host-auth')}
          >
            👑 Host
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/player-join')}
          >
            🎮 Play
          </button>
        </div>

        <footer className="footer">
          <p>Join a game or host your own</p>
        </footer>
      </div>
    </div>
  );
};
