import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouletteService } from '../services/rouletteService';
import type { RoulettePlayer } from '../types/roulette';
import './RouletteHostSetup.css';

function getOrCreateHostId(): string {
  let hostId = localStorage.getItem('rouletteHostId');
  if (!hostId) {
    hostId = `host_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('rouletteHostId', hostId);
  }
  return hostId;
}

export const RouletteHostSetup: React.FC = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<RoulettePlayer[]>([]);
  const [bullets, setBullets] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    const hostId = getOrCreateHostId();
    RouletteService.createGame(hostId, 1).then((code) => {
      setGameCode(code);
      localStorage.setItem('rouletteGameCode', code);
      setIsCreating(false);
    });
  }, []);

  useEffect(() => {
    if (!gameCode) return;
    const unsub = RouletteService.watchGame(gameCode, (updatedGame) => {
      if (updatedGame?.players) {
        const list = Object.values(updatedGame.players).sort((a, b) => a.name.localeCompare(b.name));
        setPlayers(list);
      } else {
        setPlayers([]);
      }
    });
    return unsub;
  }, [gameCode]);

  const handleBulletsChange = useCallback(async (value: number) => {
    if (!gameCode || value < 1 || value > 5) return;
    setBullets(value);
    await RouletteService.updateBullets(gameCode, value);
  }, [gameCode]);

  const handleStart = async () => {
    if (!gameCode || players.length < 2) return;
    setIsStarting(true);
    try {
      await RouletteService.startGame(gameCode);
      navigate(`/roulette/host-play/${gameCode}`);
    } catch (err) {
      console.error('Error starting roulette:', err);
      setIsStarting(false);
    }
  };

  if (isCreating) {
    return (
      <div className="rhs-page">
        <div className="rhs-container">
          <p className="rhs-loading">⏳ Setting up table...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rhs-page">
      <div className="rhs-container">
        <button className="back-btn" onClick={() => { RouletteService.deleteGame(gameCode!); navigate('/roulette'); }}>
          ← Cancel
        </button>

        <div className="rhs-card animate-in">
          <h1 className="rhs-title">🎩 Host Setup</h1>

          <div className="rhs-code-badge">
            <span className="rhs-badge-label">Room Code</span>
            <span className="rhs-badge-value">{gameCode}</span>
          </div>

          <div className="rhs-section">
            <h2>Bullets in Chamber</h2>
            <p className="rhs-hint">Out of 6 chambers</p>
            <div className="rhs-bullets-control">
              <button
                className="rhs-bullet-btn"
                onClick={() => handleBulletsChange(bullets - 1)}
                disabled={bullets <= 1}
              >
                −
              </button>
              <div className="rhs-chambers">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className={`rhs-chamber ${i < bullets ? 'rhs-chamber-bullet' : 'rhs-chamber-empty'}`}
                  >
                    {i < bullets ? '🔴' : '⚪'}
                  </div>
                ))}
              </div>
              <button
                className="rhs-bullet-btn"
                onClick={() => handleBulletsChange(bullets + 1)}
                disabled={bullets >= 5}
              >
                +
              </button>
            </div>
            <p className="rhs-bullet-count">
              <strong>{bullets}</strong> bullet{bullets !== 1 ? 's' : ''} — {Math.round((bullets / 6) * 100)}% initial death chance
            </p>
          </div>

          <div className="rhs-section">
            <h2>Players ({players.length})</h2>
            <p className="rhs-hint">Share the room code — minimum 2 players to start</p>
            <ul className="rhs-players-list">
              {players.length > 0 ? (
                players.map((p, idx) => (
                  <li key={p.id} className="rhs-player-item">
                    <span className="rhs-player-num">{idx + 1}</span>
                    <span className="rhs-player-name">{p.name}</span>
                    <span className="rhs-player-ready">✓</span>
                  </li>
                ))
              ) : (
                <li className="rhs-no-players">Waiting for players to join...</li>
              )}
            </ul>
          </div>

          <button
            className="btn btn-danger btn-large rhs-start-btn"
            onClick={handleStart}
            disabled={isStarting || players.length < 2}
          >
            {isStarting ? '⏳ Starting...' : '🔫 Start Game'}
          </button>

          {players.length < 2 && (
            <p className="rhs-warn">Need at least 2 players to start</p>
          )}
        </div>
      </div>
    </div>
  );
};
