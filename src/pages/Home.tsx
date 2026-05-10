import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="home-container">
        <header className="header animate-in">
          <span className="title-emoji">🎭</span>
          <h1>MAFIA</h1>
          <p className="subtitle">The ultimate social deduction game</p>
        </header>

        <nav className="game-cards animate-in" style={{ animationDelay: '0.1s' }}>
          <button className="game-card card-host" onClick={() => navigate('/host-auth')}>
            <span className="card-emoji">👑</span>
            <div className="card-body">
              <span className="card-title">Host</span>
              <span className="card-desc">Create &amp; run a game session</span>
            </div>
            <span className="card-arrow">→</span>
          </button>

          <button className="game-card card-play" onClick={() => navigate('/player-join')}>
            <span className="card-emoji">🎮</span>
            <div className="card-body">
              <span className="card-title">Play</span>
              <span className="card-desc">Join with a room code</span>
            </div>
            <span className="card-arrow">→</span>
          </button>
        </nav>

        <footer className="home-footer animate-in" style={{ animationDelay: '0.2s' }}>
          <p>Gather your group · Assign roles · Find the mafia</p>
        </footer>
      </div>
    </div>
  );
};
