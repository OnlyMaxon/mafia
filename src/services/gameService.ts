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
import type { GameState, GameRoles, Player } from '../types/game';
import { generateGameCode } from '../utils/gameLogic';

export class GameService {
  static async createGame(hostId: string): Promise<string> {
    const gameCode = generateGameCode();
    const gameRef = ref(database, `games/${gameCode}`);

    const gameState: GameState = {
      id: gameCode,
      hostId,
      gameCode,
      status: 'waiting',
      players: [],
      roles: {
        mafia: 0,
        sheriff: 0,
        doctor: 0,
        maniac: 0,
        prostitute: 0,
        civilian: 0,
      },
      currentPhase: 'day',
      round: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(gameRef, gameState);
    return gameCode;
  }

  static async getGame(gameCode: string): Promise<GameState | null> {
    const gameRef = ref(database, `games/${gameCode}`);
    const snapshot = await get(gameRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  static watchGame(
    gameCode: string,
    callback: (game: GameState | null) => void
  ): () => void {
    const gameRef = ref(database, `games/${gameCode}`);
    return onValue(gameRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
  }

  static async addPlayer(gameCode: string, playerName: string): Promise<string> {
    const playersRef = ref(database, `games/${gameCode}/players`);
    const newPlayerRef = push(playersRef);

    const player: Player = {
      id: newPlayerRef.key!,
      name: playerName,
      isAlive: true,
      isReady: false,
    };

    await set(newPlayerRef, player);
    await update(ref(database, `games/${gameCode}`), { updatedAt: Date.now() });
    return newPlayerRef.key!;
  }

  static async updateGameRoles(gameCode: string, roles: GameRoles): Promise<void> {
    await update(ref(database, `games/${gameCode}`), { roles, updatedAt: Date.now() });
  }

  static async startGame(gameCode: string, roles: GameRoles): Promise<void> {
    await update(ref(database, `games/${gameCode}`), {
      status: 'playing',
      roles,
      currentPhase: 'night',
      round: 1,
      updatedAt: Date.now(),
    });
  }

  static async deleteGame(gameCode: string): Promise<void> {
    await remove(ref(database, `games/${gameCode}`));
  }

  static async updatePlayerStatus(
    gameCode: string,
    playerId: string,
    updates: Partial<Player>
  ): Promise<void> {
    await update(ref(database, `games/${gameCode}/players/${playerId}`), updates);
  }

  static async updateGameStatus(gameCode: string, status: string): Promise<void> {
    await update(ref(database, `games/${gameCode}`), { status, updatedAt: Date.now() });
  }

  static watchPlayers(
    gameCode: string,
    callback: (players: Player[]) => void
  ): () => void {
    const playersRef = ref(database, `games/${gameCode}/players`);
    return onValue(playersRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const players = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
        ...data,
        id,
      }));
      callback(players);
    });
  }

  static watchPlayersForPlayer(
    gameCode: string,
    currentPlayerId: string,
    callback: (players: Player[]) => void
  ): () => void {
    const playersRef = ref(database, `games/${gameCode}/players`);
    return onValue(playersRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const players = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => {
        const player: Player = { ...data, id };
        if (player.id !== currentPlayerId) {
          delete player.role;
        }
        return player;
      });
      callback(players);
    });
  }
}
