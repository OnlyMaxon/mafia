import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RouletteHome.css';

export const RouletteHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="roulette-home">
      <div className="rh-bg">
        <div className="rh-orb rh-orb-1" />
        <div className="rh-orb rh-orb-2" />
        <div className="rh-orb rh-orb-3" />
      </div>

      <div className="rh-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        <header className="rh-header animate-in">
          <span className="rh-title-emoji">🔫</span>
          <h1 className="rh-title">RUSSIAN ROULETTE</h1>
          <p className="rh-subtitle">One bullet. Six chambers. Who dares pull?</p>
        </header>

        <nav className="rh-cards animate-in" style={{ animationDelay: '0.1s' }}>
          <button className="rh-card rh-card-host" onClick={() => navigate('/roulette/host-setup')}>
            <span className="rh-card-emoji">🎩</span>
            <div className="rh-card-body">
              <span className="rh-card-title">Host</span>
              <span className="rh-card-desc">Create a table & invite players</span>
            </div>
            <span className="rh-card-arrow">→</span>
          </button>

          <button className="rh-card rh-card-play" onClick={() => navigate('/roulette/join')}>
            <span className="rh-card-emoji">🎲</span>
            <div className="rh-card-body">
              <span className="rh-card-title">Play</span>
              <span className="rh-card-desc">Join with a room code</span>
            </div>
            <span className="rh-card-arrow">→</span>
          </button>
        </nav>

        <footer className="rh-footer animate-in" style={{ animationDelay: '0.2s' }}>
          <p>Spin the cylinder · Pull the trigger · Test your fate</p>
        </footer>
      </div>
    </div>
  );
};
