import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RouletteService } from '../services/rouletteService';
import type { RouletteGame, RoulettePlayer } from '../types/roulette';
import './RouletteHostPlay.css';

const CHAMBER_POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
  const r = 72;
  return {
    x: Math.round(r * Math.cos(angle)),
    y: Math.round(r * Math.sin(angle)),
  };
});

function toArray<T>(val: T[] | Record<string, T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

export const RouletteHostPlay: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<RouletteGame | null>(null);
  const [players, setPlayers] = useState<RoulettePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [flashResult, setFlashResult] = useState<'safe' | 'dead' | null>(null);
  const [flashPlayer, setFlashPlayer] = useState('');
  const prevTimestamp = useRef<number>(0);

  useEffect(() => {
    if (!gameCode) {
      navigate('/roulette');
      return;
    }

    const unsub = RouletteService.watchGame(gameCode, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);

      if (updatedGame?.players) {
        const list = Object.values(updatedGame.players);
        setPlayers(list);
      }

      if (updatedGame?.lastPull && updatedGame.lastPull.timestamp !== prevTimestamp.current) {
        prevTimestamp.current = updatedGame.lastPull.timestamp;
        setFlashResult(updatedGame.lastPull.result);
        setFlashPlayer(updatedGame.lastPull.playerName);
        setTimeout(() => setFlashResult(null), 2800);
      }
    });

    return unsub;
  }, [gameCode, navigate]);

  const handlePull = async () => {
    if (!gameCode || isPulling || game?.status !== 'playing') return;
    setIsPulling(true);
    try {
      await RouletteService.pullTrigger(gameCode);
    } finally {
      setIsPulling(false);
    }
  };

  const handleEndGame = async () => {
    if (!gameCode) return;
    if (!window.confirm('End the game? All data will be deleted.')) return;
    await RouletteService.updateBullets(gameCode, game?.settings.bullets ?? 1);
    await RouletteService.deleteGame(gameCode);
    localStorage.removeItem('rouletteGameCode');
    navigate('/roulette');
  };

  if (loading) {
    return <div className="rhp-page"><div className="rhp-center"><h2>⏳ Loading...</h2></div></div>;
  }

  if (!game) {
    return (
      <div className="rhp-page">
        <div className="rhp-center">
          <h2>❌ Game not found</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/roulette')}>← Back</button>
        </div>
      </div>
    );
  }

  const bulletChambers = toArray<number>(game.bulletChambers as any);
  const playerOrder = toArray<string>(game.playerOrder as any);
  const currentPlayerId = playerOrder[game.currentPlayerIndex];
  const currentPlayer = currentPlayerId ? game.players[currentPlayerId] : null;

  const winner = game.winnerId ? game.players[game.winnerId] : null;

  const orderedPlayers = playerOrder.map((id) => game.players[id]).filter(Boolean);

  return (
    <div className="rhp-page">
      {flashResult && (
        <div className={`rhp-flash rhp-flash-${flashResult}`}>
          {flashResult === 'safe' ? (
            <><span className="rhp-flash-icon">💨</span><span>CLICK! {flashPlayer} is safe</span></>
          ) : (
            <><span className="rhp-flash-icon">💥</span><span>BANG! {flashPlayer} is dead!</span></>
          )}
        </div>
      )}

      <div className="rhp-container">
        <div className="rhp-header">
          <div>
            <h1>🎩 Host View</h1>
            <p className="rhp-code">{gameCode}</p>
          </div>
          <button className="btn btn-danger" onClick={handleEndGame}>
            🏁 End Game
          </button>
        </div>

        {game.status === 'finished' && winner ? (
          <div className="rhp-winner animate-in">
            <div className="rhp-winner-icon">🏆</div>
            <h2>{winner.name} survives!</h2>
            <p>Last one standing</p>
            <button className="btn btn-danger" style={{ marginTop: 24 }} onClick={handleEndGame}>
              Close Table
            </button>
          </div>
        ) : (
          <div className="rhp-content">
            <div className="rhp-left">
              <div className="rhp-chamber-section">
                <h2>Cylinder — {game.settings.bullets} bullet{game.settings.bullets !== 1 ? 's' : ''}</h2>
                <div className="rhp-ring">
                  <div className="rhp-ring-center">🔫</div>
                  {CHAMBER_POSITIONS.map((pos, idx) => {
                    const isCurrent = idx === game.currentChamber;
                    const isFired = idx < game.currentChamber;
                    const isBullet = bulletChambers.includes(idx);

                    let cls = 'rhp-chamber';
                    if (isCurrent) cls += ' rhp-chamber-current';
                    else if (isFired && isBullet) cls += ' rhp-chamber-dead';
                    else if (isFired) cls += ' rhp-chamber-safe';

                    return (
                      <div
                        key={idx}
                        className={cls}
                        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                      >
                        {isFired && isBullet ? '🔴' : isFired ? '⚫' : isCurrent ? '●' : ''}
                      </div>
                    );
                  })}
                </div>
                <p className="rhp-chamber-info">
                  Chamber {game.currentChamber + 1} / 6
                </p>
              </div>

              {game.status === 'playing' && currentPlayer && (
                <div className="rhp-turn-info">
                  <p className="rhp-turn-label">Current Player</p>
                  <p className="rhp-turn-name">{currentPlayer.name}</p>
                  <button
                    className={`rhp-pull-btn ${isPulling ? 'rhp-pulling' : ''}`}
                    onClick={handlePull}
                    disabled={isPulling}
                  >
                    {isPulling ? '⏳ Firing...' : '🔫 Pull Trigger'}
                  </button>
                </div>
              )}
            </div>

            <div className="rhp-right">
              <h2>Players ({players.filter((p) => p.isAlive).length} alive)</h2>
              <ul className="rhp-players">
                {orderedPlayers.map((player, idx) => (
                  <li
                    key={player.id}
                    className={`rhp-player ${!player.isAlive ? 'rhp-player-dead' : ''} ${player.id === currentPlayerId && player.isAlive ? 'rhp-player-current' : ''}`}
                  >
                    <span className="rhp-player-num">{idx + 1}</span>
                    <span className="rhp-player-name">{player.name}</span>
                    <span className="rhp-player-status">
                      {!player.isAlive ? '💀' : player.id === currentPlayerId ? '🎯' : '✓'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
