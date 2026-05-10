import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import type { GameState, Player } from '../types/game';
import { assignRolesToPlayers } from '../utils/gameLogic';
import './HostWaiting.css';

export const HostWaiting: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!gameCode) {
      navigate('/host-editor');
      return;
    }

    const unsubscribeGame = GameService.watchGame(gameCode, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);
    });

    const unsubscribePlayers = GameService.watchPlayers(gameCode, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameCode, navigate]);

  const handleStartGame = async () => {
    if (!game) return;
    setIsStarting(true);
    try {
      const playersWithRoles = assignRolesToPlayers(players, game.roles);
      for (const player of playersWithRoles) {
        await GameService.updatePlayerStatus(gameCode!, player.id, { role: player.role });
      }
      await GameService.startGame(gameCode!, game.roles);
      navigate(`/host-game/${gameCode}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="host-waiting">
        <div className="container">
          <h1>⏳ Loading...</h1>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="host-waiting">
        <div className="container">
          <h1>❌ Game not found</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/host-editor')}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const rolesSummary = [
    `🔪 Mafia: ${game.roles.mafia}`,
    `⭐ Sheriff: ${game.roles.sheriff}`,
    `💊 Doctor: ${game.roles.doctor}`,
    `😈 Maniac: ${game.roles.maniac}`,
    `👯 Courtesan: ${game.roles.prostitute}`,
    `👤 Civilian: ${game.roles.civilian}`,
  ];

  return (
    <div className="host-waiting">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/host-editor')}>
          ← Back
        </button>

        <div className="waiting-card">
          <h1>👑 Waiting for Players</h1>

          <div className="game-code-badge">
            <span className="badge-label">Room Code</span>
            <span className="badge-value">{gameCode}</span>
          </div>

          <div className="info-section">
            <h2>Role Setup</h2>
            <div className="roles-summary">
              {rolesSummary.map((role, i) => (
                <span key={i} className="role-tag">{role}</span>
              ))}
            </div>
          </div>

          <div className="players-section">
            <h2>Connected Players ({players.length})</h2>
            <ul className="players-list">
              {players.length > 0 ? (
                players.map((player, idx) => (
                  <li key={player.id} className="player-item">
                    <span className="player-number">{idx + 1}</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-status">✓</span>
                  </li>
                ))
              ) : (
                <li className="no-players">Waiting for players to join...</li>
              )}
            </ul>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleStartGame}
            disabled={isStarting || players.length === 0}
          >
            {isStarting ? '⏳ Starting game...' : '▶️ Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
};
