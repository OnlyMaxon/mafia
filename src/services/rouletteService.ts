import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
} from 'firebase/database';
import { database } from './firebase';
import type { RouletteGame, RoulettePlayer, RoulettePull } from '../types/roulette';
import { generateGameCode } from '../utils/gameLogic';

function generateBulletPositions(count: number): number[] {
  const chambers = [0, 1, 2, 3, 4, 5];
  for (let i = chambers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chambers[i], chambers[j]] = [chambers[j], chambers[i]];
  }
  return chambers.slice(0, count).sort((a, b) => a - b);
}

function toArray<T>(val: T[] | Record<string, T> | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

export class RouletteService {
  static async createGame(hostId: string, bullets: number): Promise<string> {
    const gameCode = generateGameCode();
    const gameRef = ref(database, `roulette/${gameCode}`);

    const game: RouletteGame = {
      id: gameCode,
      hostId,
      gameCode,
      status: 'waiting',
      settings: { bullets },
      bulletChambers: [],
      currentChamber: 0,
      players: {},
      playerOrder: [],
      currentPlayerIndex: 0,
      lastPull: null,
      winnerId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(gameRef, game);
    return gameCode;
  }

  static async getGame(gameCode: string): Promise<RouletteGame | null> {
    const gameRef = ref(database, `roulette/${gameCode}`);
    const snapshot = await get(gameRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  static async updateBullets(gameCode: string, bullets: number): Promise<void> {
    await update(ref(database, `roulette/${gameCode}`), {
      'settings/bullets': bullets,
      updatedAt: Date.now(),
    });
  }

  static async addPlayer(gameCode: string, playerName: string): Promise<string> {
    const playersRef = ref(database, `roulette/${gameCode}/players`);
    const newPlayerRef = push(playersRef);
    const playerId = newPlayerRef.key!;

    const player: RoulettePlayer = {
      id: playerId,
      name: playerName,
      isAlive: true,
      order: 0,
    };

    await set(newPlayerRef, player);
    await update(ref(database, `roulette/${gameCode}`), { updatedAt: Date.now() });
    return playerId;
  }

  static async startGame(gameCode: string): Promise<void> {
    const game = await this.getGame(gameCode);
    if (!game) throw new Error('Game not found');

    const playerIds = Object.keys(game.players || {});
    const playerOrder = [...playerIds].sort(() => Math.random() - 0.5);
    const bulletChambers = generateBulletPositions(game.settings.bullets);

    const playerUpdates: Record<string, number> = {};
    playerOrder.forEach((id, idx) => {
      playerUpdates[`roulette/${gameCode}/players/${id}/order`] = idx;
    });

    await update(ref(database), {
      ...playerUpdates,
      [`roulette/${gameCode}/status`]: 'playing',
      [`roulette/${gameCode}/playerOrder`]: playerOrder,
      [`roulette/${gameCode}/currentPlayerIndex`]: 0,
      [`roulette/${gameCode}/bulletChambers`]: bulletChambers,
      [`roulette/${gameCode}/currentChamber`]: 0,
      [`roulette/${gameCode}/lastPull`]: null,
      [`roulette/${gameCode}/updatedAt`]: Date.now(),
    });
  }

  static async pullTrigger(gameCode: string): Promise<void> {
    const game = await this.getGame(gameCode);
    if (!game || game.status !== 'playing') return;

    const bulletChambers = toArray<number>(game.bulletChambers as any);
    const playerOrder = toArray<string>(game.playerOrder as any);

    const chamber = game.currentChamber;
    const isDead = bulletChambers.includes(chamber);
    const currentPlayerId = playerOrder[game.currentPlayerIndex];
    if (!currentPlayerId) return;

    const lastPull: RoulettePull = {
      playerId: currentPlayerId,
      playerName: game.players[currentPlayerId]?.name || 'Unknown',
      result: isDead ? 'dead' : 'safe',
      chamber,
      timestamp: Date.now(),
    };

    const updates: Record<string, any> = {
      [`roulette/${gameCode}/lastPull`]: lastPull,
      [`roulette/${gameCode}/updatedAt`]: Date.now(),
    };

    if (isDead) {
      updates[`roulette/${gameCode}/players/${currentPlayerId}/isAlive`] = false;
    }

    const nextChamber = (chamber + 1) % 6;
    updates[`roulette/${gameCode}/currentChamber`] = nextChamber;

    if (nextChamber === 0) {
      updates[`roulette/${gameCode}/bulletChambers`] = generateBulletPositions(game.settings.bullets);
    }

    const updatedAlive: Record<string, boolean> = {};
    playerOrder.forEach((id) => {
      if (id === currentPlayerId) {
        updatedAlive[id] = !isDead;
      } else {
        updatedAlive[id] = game.players[id]?.isAlive ?? true;
      }
    });

    const alivePlayerIds = playerOrder.filter((id) => updatedAlive[id]);

    if (alivePlayerIds.length <= 1) {
      updates[`roulette/${gameCode}/status`] = 'finished';
      updates[`roulette/${gameCode}/winnerId`] = alivePlayerIds[0] || null;
    } else {
      let nextIndex = (game.currentPlayerIndex + 1) % playerOrder.length;
      while (!updatedAlive[playerOrder[nextIndex]]) {
        nextIndex = (nextIndex + 1) % playerOrder.length;
      }
      updates[`roulette/${gameCode}/currentPlayerIndex`] = nextIndex;
    }

    await update(ref(database), updates);
  }

  static watchGame(
    gameCode: string,
    callback: (game: RouletteGame | null) => void
  ): () => void {
    const gameRef = ref(database, `roulette/${gameCode}`);
    return onValue(gameRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
  }

  static async deleteGame(gameCode: string): Promise<void> {
    await remove(ref(database, `roulette/${gameCode}`));
  }
}
