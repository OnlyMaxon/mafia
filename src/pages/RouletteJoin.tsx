import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouletteService } from '../services/rouletteService';
import './RouletteJoin.css';

export const RouletteJoin: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimCode = code.trim().toUpperCase();
    const trimName = name.trim();

    if (!trimCode || trimCode.length !== 6) {
      setError('Enter a valid 6-character room code.');
      return;
    }
    if (!trimName || trimName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const game = await RouletteService.getGame(trimCode);
      if (!game) {
        setError('Room not found. Check the code and try again.');
        return;
      }
      if (game.status === 'playing') {
        setError('Game already started. You cannot join mid-game.');
        return;
      }
      if (game.status === 'finished') {
        setError('This game has ended.');
        return;
      }

      const playerId = await RouletteService.addPlayer(trimCode, trimName);
      localStorage.setItem('roulettePlayerId', playerId);
      localStorage.setItem('roulettePlayerName', trimName);
      localStorage.setItem('rouletteGameCode', trimCode);
      navigate(`/roulette/play/${trimCode}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="rj-page">
      <div className="rj-container">
        <button className="back-btn" onClick={() => navigate('/roulette')}>
          ← Back
        </button>

        <div className="rj-card animate-in">
          <h1 className="rj-title">🎲 Join Table</h1>
          <p className="rj-subtitle">Enter the room code to sit down</p>

          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label>Room Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD12"
                maxLength={6}
                autoComplete="off"
                autoFocus
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: 800 }}
              />
            </div>

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Viktor"
                maxLength={20}
                autoComplete="off"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-danger btn-large"
              disabled={isJoining}
            >
              {isJoining ? '⏳ Joining...' : '🔫 Join Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
