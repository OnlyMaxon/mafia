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

    // Подписываемся на изменения игры и игроков
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
      // Раздаем роли игрокам
      const playersWithRoles = assignRolesToPlayers(players, game.roles);

      // Обновляем каждого игрока с его ролью
      for (const player of playersWithRoles) {
        await GameService.updatePlayerStatus(gameCode!, player.id, {
          role: player.role,
        });
      }

      // Запускаем игру
      await GameService.startGame(gameCode!, game.roles);

      // Переходим на страницу хоста во время игры
      navigate(`/host-game/${gameCode}`);
    } catch (err) {
      console.error('Ошибка при запуске игры:', err);
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="host-waiting">
        <div className="container">
          <h1>⏳ Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="host-waiting">
        <div className="container">
          <h1>❌ Игра не найдена</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/host-editor')}>
            ← Вернуться
          </button>
        </div>
      </div>
    );
  }

  const rolesSummary = [
    `🔪 Мафия: ${game.roles.mafia}`,
    `⭐ Шериф: ${game.roles.sheriff}`,
    `💊 Доктор: ${game.roles.doctor}`,
    `😈 Маньяк: ${game.roles.maniac}`,
    `👯 Путана: ${game.roles.prostitute}`,
    `👤 Мирных: ${game.roles.civilian}`,
  ];

  return (
    <div className="host-waiting">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/host-editor')}>
          ← Назад
        </button>

        <div className="waiting-card">
          <h1>👑 Ожидание игроков</h1>
          <p className="game-code">Код комнаты: <strong>{gameCode}</strong></p>

          <div className="info-section">
            <h2>Расстановка ролей:</h2>
            <div className="roles-summary">
              {rolesSummary.map((role, i) => (
                <span key={i} className="role-tag">{role}</span>
              ))}
            </div>
          </div>

          <div className="players-section">
            <h2>👥 Подключенные игроки ({players.length}):</h2>
            <ul className="players-list">
              {players.length > 0 ? (
                players.map((player) => (
                  <li key={player.id} className="player-item">
                    <span className="player-number">{players.indexOf(player) + 1}.</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-status">✓</span>
                  </li>
                ))
              ) : (
                <li className="no-players">Ожидание игроков...</li>
              )}
            </ul>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleStartGame}
            disabled={isStarting || players.length === 0}
          >
            {isStarting ? '⏳ Запуск игры...' : '▶️ Начать игру'}
          </button>
        </div>
      </div>
    </div>
  );
};
