import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import './PlayerJoin.css';

export const PlayerJoin: React.FC = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState(() => {
    const saved = localStorage.getItem('gameCode');
    return saved || '';
  });
  const [playerName, setPlayerName] = useState(() => {
    const saved = localStorage.getItem('playerName');
    return saved || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const game = await GameService.getGame(gameCode.toUpperCase());

      if (!game) {
        setError('❌ Room not found');
        setIsLoading(false);
        return;
      }

      if (game.status === 'finished') {
        setError('❌ This game is already finished');
        setIsLoading(false);
        return;
      }

      const playerId = await GameService.addPlayer(gameCode.toUpperCase(), playerName);

      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', playerName);
      localStorage.setItem('gameCode', gameCode.toUpperCase());

      navigate(`/player-waiting/${gameCode.toUpperCase()}`);
    } catch (err) {
      setError('❌ Error joining room');
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="player-join">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        <div className="join-card">
          <h1>🎮 Join Game</h1>
          <p className="description">Enter room code and your name</p>

          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label htmlFor="gameCode">Room Code</label>
              <input
                id="gameCode"
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                disabled={isLoading}
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="playerName">Your Name</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                disabled={isLoading}
                maxLength={20}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !gameCode || !playerName}
            >
              {isLoading ? '⏳ Connecting...' : '✓ Join'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
