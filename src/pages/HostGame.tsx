import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import type { GameState, Player } from '../types/game';
import { getRoleNameRu } from '../utils/gameLogic';
import './HostGame.css';

export const HostGame: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameCode) {
      navigate('/host-editor');
      return;
    }

    // Подписываемся на изменения игры и игроков
    const unsubscribeGame = GameService.watchGame(gameCode, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);

      // Если игра закончилась
      if (updatedGame?.status === 'finished') {
        setTimeout(() => {
          if (window.confirm('🎉 Игра закончилась! Хотите начать новую?')) {
            navigate('/host-editor');
          }
        }, 1000);
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

  const handleClearNotes = () => {
    setNotes('');
  };

  const handleFinishGame = async () => {
    if (!gameCode) return;

    if (window.confirm('Вы уверены, что хотите завершить игру?')) {
      await GameService.updateGameStatus(gameCode, 'finished');
    }
  };

  if (loading) {
    return (
      <div className="host-game">
        <div className="container">
          <h1>⏳ Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="host-game">
        <div className="container">
          <h1>❌ Игра не найдена</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/host-editor')}>
            ← Вернуться
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
            <h1>👑 Ведущий</h1>
            <p className="game-code">Код: {gameCode}</p>
          </div>
          <button className="btn btn-danger" onClick={handleFinishGame}>
            🏁 Завершить игру
          </button>
        </div>

        <div className="game-content">
          <div className="players-section">
            <h2>👥 Роли игроков ({players.length})</h2>
            <div className="players-grid">
              {players.map((player, index) => (
                <div key={player.id} className="player-card">
                  <div className="player-number">{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className={`player-role role-${player.role}`}>
                      {player.role ? getRoleNameRu(player.role as any) : '?'}
                    </div>
                  </div>
                  {!player.isAlive && <div className="dead-badge">💀</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="notes-section">
            <h2>📝 Заметки ведущего</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Пишите свои заметки здесь...
Например:
- День 1: проголосовали за Ивана
- Убита медсестра
- Маньяк активен"
              className="notes-textarea"
            />
            <button className="btn btn-secondary" onClick={handleClearNotes}>
              🗑️ Очистить заметки
            </button>
          </div>
        </div>

        <div className="game-info">
          <div className="info-box">
            <span>Раунд:</span>
            <strong>{game.round}</strong>
          </div>
          <div className="info-box">
            <span>Фаза:</span>
            <strong>{game.currentPhase === 'day' ? '☀️ День' : '🌙 Ночь'}</strong>
          </div>
          <div className="info-box">
            <span>Статус:</span>
            <strong>{game.status === 'playing' ? '🎮 Игра идёт' : '⏸️ Пауза'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
