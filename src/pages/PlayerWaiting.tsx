import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import type { GameState, Player } from '../types/game';
import './PlayerWaiting.css';

export const PlayerWaiting: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerRole, setPlayerRole] = useState<string | undefined>();
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
          setPlayerRole(currentPlayer.role);
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
            <p className="game-code">Code: {gameCode}</p>
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
        <div className="waiting-card">
          <h1>🎭 Waiting for Game to Start</h1>
          <p className="game-code">Code: {gameCode}</p>

          {playerRole ? (
            <div className="role-revealed">
              <h2>🎭 Your Role:</h2>
              <div className="role-badge">{playerRole}</div>
            </div>
          ) : (
            <div className="role-waiting">
              <h2>⏳ Waiting for role...</h2>
            </div>
          )}

          <div className="players-list">
            <h3>👥 Players ({players.length}):</h3>
            <ul>
              {players.map((player) => (
                <li key={player.id}>
                  <span className="player-name">{player.name}</span>
                  {player.role && <span className="player-role">{player.role}</span>}
                </li>
              ))}
            </ul>
          </div>

          {gameStarted && (
            <div className="game-started">
              <h2>🎮 Game Started!</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
