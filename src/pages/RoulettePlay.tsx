import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RouletteService } from '../services/rouletteService';
import type { RouletteGame, RoulettePlayer } from '../types/roulette';
import './RoulettePlay.css';

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

export const RoulettePlay: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<RouletteGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [flashResult, setFlashResult] = useState<'safe' | 'dead' | null>(null);
  const [flashPlayer, setFlashPlayer] = useState('');
  const [iAmDead, setIAmDead] = useState(false);
  const prevTimestamp = useRef<number>(0);

  const playerId = localStorage.getItem('roulettePlayerId') || '';
  const playerName = localStorage.getItem('roulettePlayerName') || '';

  useEffect(() => {
    if (!gameCode || !playerId) {
      navigate('/roulette/join');
      return;
    }

    const unsub = RouletteService.watchGame(gameCode, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);

      if (updatedGame?.players?.[playerId]) {
        setIAmDead(!updatedGame.players[playerId].isAlive);
      }

      if (updatedGame?.lastPull && updatedGame.lastPull.timestamp !== prevTimestamp.current) {
        prevTimestamp.current = updatedGame.lastPull.timestamp;
        setFlashResult(updatedGame.lastPull.result);
        setFlashPlayer(updatedGame.lastPull.playerName);
        setTimeout(() => setFlashResult(null), 2800);
      }
    });

    return unsub;
  }, [gameCode, playerId, navigate]);

  const handlePull = async () => {
    if (!gameCode || isPulling || game?.status !== 'playing') return;
    setIsPulling(true);
    try {
      await RouletteService.pullTrigger(gameCode);
    } finally {
      setIsPulling(false);
    }
  };

  if (loading) {
    return <div className="rp-page"><div className="rp-center"><h2>⏳ Loading...</h2></div></div>;
  }

  if (!game) {
    return (
      <div className="rp-page">
        <div className="rp-center">
          <h2>❌ Room not found</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/roulette/join')}>← Back</button>
        </div>
      </div>
    );
  }

  const bulletChambers = toArray<number>(game.bulletChambers as any);
  const playerOrder = toArray<string>(game.playerOrder as any);
  const currentPlayerId = playerOrder[game.currentPlayerIndex];
  const currentPlayer = currentPlayerId ? game.players[currentPlayerId] : null;
  const isMyTurn = currentPlayerId === playerId && game.status === 'playing' && !iAmDead;
  const winner = game.winnerId ? game.players[game.winnerId] : null;

  const orderedPlayers: RoulettePlayer[] = playerOrder
    .map((id) => game.players[id])
    .filter(Boolean);

  if (game.status === 'waiting') {
    return (
      <div className="rp-page">
        <div className="rp-container">
          <div className="rp-waiting-card animate-in">
            <h1>🔫 Waiting to Start</h1>
            <div className="rp-code-badge">
              <span className="rp-badge-label">Room Code</span>
              <span className="rp-badge-value">{gameCode}</span>
            </div>
            <p className="rp-waiting-msg">The host is setting up the table...</p>
            <div className="rp-players-wait">
              <h3>Players at the table</h3>
              <ul>
                {Object.values(game.players || {}).map((p) => (
                  <li key={p.id} className={p.id === playerId ? 'rp-me' : ''}>
                    {p.name}{p.id === playerId ? ' (you)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-page">
      {flashResult && (
        <div className={`rp-flash rp-flash-${flashResult}`}>
          {flashResult === 'safe' ? (
            <><span className="rp-flash-icon">💨</span><span>CLICK! {flashPlayer} is safe</span></>
          ) : (
            <><span className="rp-flash-icon">💥</span><span>BANG! {flashPlayer} is dead!</span></>
          )}
        </div>
      )}

      <div className="rp-container">
        <div className="rp-header">
          <h1>🔫 Russian Roulette</h1>
          <span className="rp-code">{gameCode}</span>
        </div>

        {game.status === 'finished' && winner ? (
          <div className="rp-winner animate-in">
            <div className="rp-winner-icon">
              {winner.id === playerId ? '🏆' : '☠️'}
            </div>
            <h2>
              {winner.id === playerId
                ? 'You survived!'
                : `${winner.name} survives!`}
            </h2>
            <p>{winner.id === playerId ? 'Fortune favors the bold.' : 'Last one standing.'}</p>
            <button className="btn btn-secondary" style={{ marginTop: 28 }} onClick={() => navigate('/roulette/join')}>
              ← Leave Table
            </button>
          </div>
        ) : (
          <div className="rp-content">
            <div className="rp-left">
              {/* Chamber visualization */}
              <div className="rp-cylinder-section">
                <p className="rp-cylinder-label">
                  {game.settings.bullets} bullet{game.settings.bullets !== 1 ? 's' : ''} · Chamber {game.currentChamber + 1}/6
                </p>
                <div className="rp-ring">
                  <div className="rp-ring-center">🔫</div>
                  {CHAMBER_POSITIONS.map((pos, idx) => {
                    const isCurrent = idx === game.currentChamber;
                    const isFired = idx < game.currentChamber;
                    const isBullet = bulletChambers.includes(idx);

                    let cls = 'rp-chamber';
                    if (isCurrent) cls += ' rp-chamber-current';
                    else if (isFired && isBullet) cls += ' rp-chamber-dead';
                    else if (isFired) cls += ' rp-chamber-safe';

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
              </div>

              {/* Current turn */}
              {game.status === 'playing' && currentPlayer && (
                <div className={`rp-turn-box ${isMyTurn ? 'rp-turn-mine' : ''}`}>
                  {isMyTurn ? (
                    <>
                      <p className="rp-turn-you">⚠️ IT'S YOUR TURN</p>
                      <p className="rp-your-name">{playerName}</p>
                      <button
                        className={`rp-pull-btn ${isPulling ? 'rp-pulling' : ''}`}
                        onClick={handlePull}
                        disabled={isPulling}
                      >
                        {isPulling ? '💥 Firing...' : '🔫 PULL TRIGGER'}
                      </button>
                    </>
                  ) : iAmDead ? (
                    <>
                      <p className="rp-turn-dead">💀 You're dead</p>
                      <p className="rp-turn-watching">Watching from the beyond...</p>
                    </>
                  ) : (
                    <>
                      <p className="rp-turn-label">Now pulling:</p>
                      <p className="rp-turn-name">{currentPlayer.name}</p>
                      <div className="rp-waiting-anim">
                        <span>•</span><span>•</span><span>•</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Player list */}
            <div className="rp-right">
              <h3>Players ({orderedPlayers.filter((p) => p.isAlive).length} alive)</h3>
              <ul className="rp-players">
                {orderedPlayers.map((player, idx) => (
                  <li
                    key={player.id}
                    className={[
                      'rp-player',
                      !player.isAlive ? 'rp-player-dead' : '',
                      player.id === currentPlayerId && player.isAlive ? 'rp-player-current' : '',
                      player.id === playerId ? 'rp-player-me' : '',
                    ].join(' ')}
                  >
                    <span className="rp-pl-num">{idx + 1}</span>
                    <span className="rp-pl-name">
                      {player.name}
                      {player.id === playerId && <span className="rp-you-tag"> (you)</span>}
                    </span>
                    <span className="rp-pl-status">
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
