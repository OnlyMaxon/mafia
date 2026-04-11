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

  const handleCreateNew = async () => {
    setIsLoading(true);
    try {
      const hostId = `host_${Date.now()}`;
      const code = await GameService.createGame(hostId);
      localStorage.setItem('gameCode', code);
      navigate('/host-editor');
    } catch (err) {
      setError('Ошибка при создании игры');
    }
    setIsLoading(false);
  };

  const handleJoinGame = async () => {
    setError('');
    if (!gameCode.trim()) {
      setError('⚠️ Введите код комнаты');
      return;
    }

    setIsLoading(true);
    try {
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

      if (game.status === 'playing') {
        setError('❌ Игра уже идет, присоединиться нельзя');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('gameCode', gameCode.toUpperCase());
      navigate(`/host-game/${gameCode.toUpperCase()}`);
    } catch (err) {
      setError('❌ Ошибка подключения');
    }
    setIsLoading(false);
  };

  return (
    <div className="host-choice">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Назад
        </button>

        {mode === 'choice' ? (
          <div className="choice-card">
            <h1>👑 Ведущий</h1>
            <p className="description">Выберите действие</p>

            <div className="buttons-group">
              <button
                className="action-btn create-btn"
                onClick={handleCreateNew}
                disabled={isLoading}
              >
                ➕ Создать новую игру
              </button>

              <button
                className="action-btn join-btn"
                onClick={() => setMode('join')}
                disabled={isLoading}
              >
                🔄 Присоединиться к игре
              </button>
            </div>
          </div>
        ) : (
          <div className="choice-card">
            <h1>👑 Присоединиться</h1>
            <p className="description">Введите код комнаты</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinGame();
              }}
            >
              <div className="form-group">
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="Например: ABC123"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="buttons-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !gameCode}
                >
                  {isLoading ? '⏳ Подключение...' : '✓ Присоединиться'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setMode('choice');
                    setGameCode('');
                    setError('');
                  }}
                  disabled={isLoading}
                >
                  ← Вернуться
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
