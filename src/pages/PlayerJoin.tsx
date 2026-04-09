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
      // Проверяем, существует ли игра
      const game = await GameService.getGame(gameCode.toUpperCase());
      
      if (!game) {
        setError('❌ Комната не найдена');
        setIsLoading(false);
        return;
      }

      if (game.status === 'finished') {
        setError('❌ Эта игра уже завершена');
        setIsLoading(false);
        return;
      }

      // Добавляем игрока
      const playerId = await GameService.addPlayer(gameCode.toUpperCase(), playerName);
      
      // Сохраняем данные и переходим в комнату
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', playerName);
      localStorage.setItem('gameCode', gameCode.toUpperCase());
      
      navigate(`/player-waiting/${gameCode.toUpperCase()}`);
    } catch (err) {
      setError('❌ Ошибка при присоединении к комнате');
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="player-join">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Назад
        </button>

        <div className="join-card">
          <h1>🎮 Присоединиться к игре</h1>
          <p className="description">Введите код комнаты и своё имя</p>

          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label htmlFor="gameCode">Код комнаты</label>
              <input
                id="gameCode"
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Например: ABC123"
                disabled={isLoading}
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="playerName">Ваше имя</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите ваше имя"
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
              {isLoading ? '⏳ Подключение...' : '✓ Присоединиться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
