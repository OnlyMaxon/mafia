import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import type { GameState, Player } from '../types/game';
import { getRoleName } from '../utils/gameLogic';
import './HostGame.css';

export const HostGame: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${gameCode}`) || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(`notes_${gameCode}`, notes);
  }, [notes, gameCode]);

  useEffect(() => {
    if (game?.status === 'waiting') {
      navigate(`/host-waiting/${gameCode}`);
    }
  }, [game?.status, gameCode, navigate]);

  useEffect(() => {
    if (!gameCode) {
      navigate('/host-editor');
      return;
    }

    const unsubscribeGame = GameService.watchGame(gameCode, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);

      if (updatedGame?.status === 'finished') {
        setTimeout(() => {
          if (window.confirm('🎉 Game over! Start a new game?')) {
            localStorage.removeItem(`notes_${gameCode}`);
            localStorage.removeItem('gameCode');
            navigate('/host-editor');
          }
        }, 500);
      }
    });

    const unsubscribePlayers = GameService.watchPlayers(gameCode, (updatedPlayers) => {
      setPlayers(updatedPlayers.sort((a, b) => a.name.localeCompare(b.name)));
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameCode, navigate]);

  const handleFinishGame = async () => {
    if (!gameCode) return;
    if (window.confirm('🛑 Are you sure? All game data will be deleted from the server!')) {
      await GameService.updateGameStatus(gameCode, 'finished');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await GameService.deleteGame(gameCode);
      localStorage.removeItem(`notes_${gameCode}`);
      localStorage.removeItem('gameCode');
      navigate('/host-editor');
    }
  };

  if (loading) {
    return (
      <div className="host-game">
        <div className="container">
          <h1>⏳ Loading...</h1>
        </div>
      </div>
    );
  }

  if (!game || game.status === 'finished') {
    return (
      <div className="host-game">
        <div className="container">
          <h1>❌ Game finished or not found</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/host-editor')}>
            ← New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="host-game">
      <div className="container">
        <div className="game-header">
          <div>
            <h1>👑 Host</h1>
            <p className="game-code">{gameCode}</p>
          </div>
          <button className="btn btn-danger" onClick={handleFinishGame}>
            🏁 End Game
          </button>
        </div>

        <div className="game-content">
          <div className="players-section">
            <h2>Player Roles ({players.length})</h2>
            <div className="players-grid">
              {players.map((player, index) => (
                <div key={player.id} className="player-card">
                  <div className="player-number">{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className={`player-role role-${player.role}`}>
                      {player.role ? getRoleName(player.role as any) : '—'}
                    </div>
                  </div>
                  {!player.isAlive && <div className="dead-badge">💀</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="notes-section">
            <h2>Host Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write notes here...
e.g.:
- Day 1: voted out John
- Doctor was killed
- Maniac is active"
              className="notes-textarea"
            />
            <button className="btn btn-secondary" onClick={() => setNotes('')}>
              🗑️ Clear Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
