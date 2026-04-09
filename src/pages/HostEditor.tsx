import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameService } from '../services/gameService';
import type { GameRoles } from '../types/game';
import { validateRolesSum } from '../utils/gameLogic';
import './HostEditor.css';

export const HostEditor: React.FC = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [roles, setRoles] = useState<GameRoles>({
    mafia: 0,
    sheriff: 0,
    doctor: 0,
    maniac: 0,
    prostitute: 0,
    civilian: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState('');

  // Проверяем авторизацию
  useEffect(() => {
    if (localStorage.getItem('hostAuthorized') !== 'true') {
      navigate('/host-auth');
      return;
    }

    // Создаем новую игру
    initializeGame();
  }, [navigate]);

  const initializeGame = async () => {
    try {
      const hostId = `host_${Date.now()}`;
      const code = await GameService.createGame(hostId);
      setGameCode(code);
      localStorage.setItem('gameCode', code);
    } catch (err) {
      setError('Ошибка при создании игры');
      console.error(err);
    }
  };

  const handleRoleChange = (role: keyof GameRoles, value: number) => {
    const newRoles = { ...roles, [role]: Math.max(0, value) };
    setRoles(newRoles);

    // Обновляем общее количество
    const total = Object.values(newRoles).reduce((a, b) => a + b, 0);
    setPlayerCount(total);
  };

  const handleStartGame = async () => {
    if (!validateRolesSum(roles, playerCount)) {
      setShowAlert('⚠️ Сумма ролей не совпадает с количеством игроков!');
      return;
    }

    if (playerCount === 0) {
      setShowAlert('⚠️ Добавьте хотя бы одного игрока!');
      return;
    }

    setIsLoading(true);
    try {
      await GameService.updateGameRoles(gameCode, roles);
      localStorage.setItem('gameRoles', JSON.stringify(roles));
      navigate(`/host-waiting/${gameCode}`);
    } catch (err) {
      setShowAlert('❌ Ошибка при запуске игры');
      console.error(err);
    }
    setIsLoading(false);
  };

  const roleLabels = {
    mafia: '🔪 Мафия',
    sheriff: '⭐ Шериф',
    doctor: '💊 Доктор',
    maniac: '😈 Маньяк',
    prostitute: '👯 Путана',
    civilian: '👤 Мирный',
  };

  return (
    <div className="host-editor">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Выход
        </button>

        <div className="editor-card">
          <h1>⚙️ Настройка игры</h1>
          <p className="game-code">Код комнаты: <strong>{gameCode}</strong></p>

          <div className="roles-grid">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="role-input-group">
                <label>{label}</label>
                <div className="input-group">
                  <button
                    onClick={() =>
                      handleRoleChange(role as keyof GameRoles, roles[role as keyof GameRoles] - 1)
                    }
                    disabled={roles[role as keyof GameRoles] === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={roles[role as keyof GameRoles]}
                    onChange={(e) =>
                      handleRoleChange(role as keyof GameRoles, parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                  <button
                    onClick={() =>
                      handleRoleChange(role as keyof GameRoles, roles[role as keyof GameRoles] + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="player-count">
            <p>
              Всего игроков: <strong className={playerCount > 0 ? 'valid' : 'invalid'}>
                {playerCount}
              </strong>
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {showAlert && <div className="alert-message">{showAlert}</div>}

          <button
            className="btn btn-primary btn-large"
            onClick={handleStartGame}
            disabled={isLoading || playerCount === 0}
          >
            {isLoading ? '⏳ Запуск...' : '▶️ Начать'}
          </button>
        </div>
      </div>
    </div>
  );
};
