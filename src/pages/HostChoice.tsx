import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import './HostChoice.css';

export const HostChoice: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choice' | 'join'>('choice');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNew = () => {
    localStorage.removeItem('gameCode');
    navigate('/host-editor');
  };

  const handleJoinGame = async () => {
    setError('');
    if (!gameCode.trim()) {
      setError('⚠️ Enter room code');
      return;
    }

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

      if (game.status === 'playing') {
        setError('❌ Game already in progress');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('gameCode', gameCode.toUpperCase());
      navigate(`/host-game/${gameCode.toUpperCase()}`);
    } catch (err) {
      setError('❌ Connection error');
    }
    setIsLoading(false);
  };

  return (
    <div className="host-choice">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        {mode === 'choice' ? (
          <div className="choice-card animate-in">
            <h1>👑 Host</h1>
            <p className="description">Choose an action</p>

            <div className="buttons-group">
              <button className="action-btn create-btn" onClick={handleCreateNew}>
                ➕ Create new game
              </button>

              <button className="action-btn join-btn" onClick={() => setMode('join')}>
                🔄 Join a game
              </button>
            </div>
          </div>
        ) : (
          <div className="choice-card animate-in">
            <h1>👑 Join Game</h1>
            <p className="description">Enter room code</p>

            <form onSubmit={(e) => { e.preventDefault(); handleJoinGame(); }}>
              <div className="form-group">
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={6}
                  autoFocus
                  className="code-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="buttons-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !gameCode}
                >
                  {isLoading ? '⏳ Connecting...' : '✓ Join'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setMode('choice'); setGameCode(''); setError(''); }}
                  disabled={isLoading}
                >
                  ← Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
