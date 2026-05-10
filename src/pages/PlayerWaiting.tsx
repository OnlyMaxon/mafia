import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import type { GameState, Player, Role } from '../types/game';
import { getRoleName, getRoleDescription } from '../utils/gameLogic';
import './PlayerWaiting.css';

const ROLE_ICONS: Record<Role, string> = {
  mafia: '🔪',
  sheriff: '⭐',
  doctor: '💊',
  maniac: '😈',
  prostitute: '👯',
  civilian: '👤',
};

export const PlayerWaiting: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerRole, setPlayerRole] = useState<Role | undefined>();
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!gameCode) {
      navigate('/player-join');
      return;
    }

    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      navigate('/player-join');
      return;
    }

    const unsubscribeGame = GameService.watchGame(gameCode, (updatedGame) => {
      setGame(updatedGame);
      if (updatedGame?.status === 'playing') {
        setGameStarted(true);
      }
      setLoading(false);
    });

    const unsubscribePlayers = GameService.watchPlayersForPlayer(
      gameCode,
      playerId,
      (updatedPlayers) => {
        setPlayers(updatedPlayers);
        const currentPlayer = updatedPlayers.find((p) => p.id === playerId);
        if (currentPlayer?.role) {
          setPlayerRole(currentPlayer.role as Role);
        }
      }
    );

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameCode, navigate]);

  if (loading) {
    return (
      <div className="player-waiting">
        <div className="container">
          <h1>⏳ Loading...</h1>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="player-waiting">
        <div className="container">
          <h1>❌ Room not found</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/player-join')}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (game.status === 'finished') {
    return (
      <div className="player-waiting">
        <div className="container">
          <div className="waiting-card">
            <h1>🎉 Game Over!</h1>
            <div className="game-code-badge">
              <span className="badge-label">Room Code</span>
              <span className="badge-value">{gameCode}</span>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/player-join')}>
              ← Back to Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-waiting">
      <div className="container">
        <div className="waiting-card animate-in">
          <h1>🎭 Waiting to Start</h1>

          <div className="game-code-badge">
            <span className="badge-label">Room Code</span>
            <span className="badge-value">{gameCode}</span>
          </div>

          {playerRole ? (
            <div className={`role-revealed role-revealed-${playerRole}`}>
              <p className="role-label">Your Role</p>
              <div className="role-icon">{ROLE_ICONS[playerRole]}</div>
              <div className="role-name">{getRoleName(playerRole)}</div>
              <div className="role-desc">{getRoleDescription(playerRole)}</div>
            </div>
          ) : (
            <div className="role-waiting">
              <div className="waiting-spinner">⏳</div>
              <p>Waiting for your role...</p>
            </div>
          )}

          <div className="players-list">
            <h3>👥 Players ({players.length})</h3>
            <ul>
              {players.map((player) => (
                <li key={player.id}>
                  <span className="player-name">{player.name}</span>
                  {player.role && (
                    <span className="player-role-badge">{ROLE_ICONS[player.role as Role]}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {gameStarted && (
            <div className="game-started">
              <span className="started-icon">🎮</span>
              <span>Game has started!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
