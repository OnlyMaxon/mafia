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

  useEffect(() => {
    if (localStorage.getItem('hostAuthorized') !== 'true') {
      navigate('/host-auth');
      return;
    }
    initializeGame();
  }, [navigate]);

  const initializeGame = async () => {
    try {
      const existingCode = localStorage.getItem('gameCode');
      if (existingCode) {
        const game = await GameService.getGame(existingCode);
        if (game && game.status === 'waiting') {
          setGameCode(existingCode);
          return;
        }
      }
      const hostId = `host_${Date.now()}`;
      const code = await GameService.createGame(hostId);
      setGameCode(code);
      localStorage.setItem('gameCode', code);
    } catch (err) {
      setError('Error creating game');
      console.error(err);
    }
  };

  const handleRoleChange = (role: keyof GameRoles, value: number) => {
    const newRoles = { ...roles, [role]: Math.max(0, value) };
    setRoles(newRoles);
    const total = Object.values(newRoles).reduce((a, b) => a + b, 0);
    setPlayerCount(total);
  };

  const handleStartGame = async () => {
    if (playerCount === 0) {
      setShowAlert('⚠️ Add at least one player!');
      return;
    }

    if (!validateRolesSum(roles, playerCount)) {
      setShowAlert('⚠️ Total roles must match player count!');
      return;
    }

    setIsLoading(true);
    try {
      await GameService.updateGameRoles(gameCode, roles);
      localStorage.setItem('gameRoles', JSON.stringify(roles));
      navigate(`/host-waiting/${gameCode}`);
    } catch (err) {
      setShowAlert('❌ Error starting game');
      console.error(err);
    }
    setIsLoading(false);
  };

  const roleLabels: Record<keyof GameRoles, string> = {
    mafia: '🔪 Mafia',
    sheriff: '⭐ Sheriff',
    doctor: '💊 Doctor',
    maniac: '😈 Maniac',
    prostitute: '👯 Courtesan',
    civilian: '👤 Civilian',
  };

  return (
    <div className="host-editor">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Exit
        </button>

        <div className="editor-card animate-in">
          <h1>⚙️ Game Setup</h1>

          <div className="game-code-badge">
            <span className="badge-label">Room Code</span>
            <span className="badge-value">{gameCode || '...'}</span>
          </div>

          <div className="roles-grid">
            {(Object.entries(roleLabels) as [keyof GameRoles, string][]).map(([role, label]) => (
              <div key={role} className="role-input-group">
                <label>{label}</label>
                <div className="input-group">
                  <button
                    onClick={() => handleRoleChange(role, roles[role] - 1)}
                    disabled={roles[role] === 0}
                  >−</button>
                  <input
                    type="number"
                    value={roles[role]}
                    onChange={(e) => handleRoleChange(role, parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <button onClick={() => handleRoleChange(role, roles[role] + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="player-count">
            <p>
              Total players: <strong className={playerCount > 0 ? 'valid' : 'invalid'}>
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
            {isLoading ? '⏳ Starting...' : '▶️ Start'}
          </button>
        </div>
      </div>
    </div>
  );
};
