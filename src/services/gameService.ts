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
  // Создает новую игру
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

  // Получает игру по коду
  static async getGame(gameCode: string): Promise<GameState | null> {
    const gameRef = ref(database, `games/${gameCode}`);
    const snapshot = await get(gameRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  // Слушает изменения игры в реальном времени
  static watchGame(
    gameCode: string,
    callback: (game: GameState | null) => void
  ): () => void {
    const gameRef = ref(database, `games/${gameCode}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
    return unsubscribe;
  }

  // Добавляет игрока в комнату
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

    // Обновляем timestamp игры
    await update(ref(database, `games/${gameCode}`), {
      updatedAt: Date.now(),
    });

    return newPlayerRef.key!;
  }

  // Обновляет роли в игре
  static async updateGameRoles(gameCode: string, roles: GameRoles): Promise<void> {
    await update(ref(database, `games/${gameCode}`), {
      roles,
      updatedAt: Date.now(),
    });
  }

  // Запускает игру (перемешивает и раздает роли)
  static async startGame(gameCode: string, roles: GameRoles): Promise<void> {
    await update(ref(database, `games/${gameCode}`), {
      status: 'playing',
      roles,
      currentPhase: 'night',
      round: 1,
      updatedAt: Date.now(),
    });
  }

  // Удаляет игру
  static async deleteGame(gameCode: string): Promise<void> {
    await remove(ref(database, `games/${gameCode}`));
  }

  // Обновляет статус игрока
  static async updatePlayerStatus(
    gameCode: string,
    playerId: string,
    updates: Partial<Player>
  ): Promise<void> {
    await update(
      ref(database, `games/${gameCode}/players/${playerId}`),
      updates
    );
  }

  // Получает всех игроков
  static async getPlayers(gameCode: string): Promise<Player[]> {
    const playersRef = ref(database, `games/${gameCode}/players`);
    const snapshot = await get(playersRef);
    
    if (!snapshot.exists()) return [];
    
    const playersObj = snapshot.val();
    return Object.entries(playersObj).map(([id, data]: [string, any]) => ({
      ...data,
      id,
    }));
  }

  // Обновляет статус игры
  static async updateGameStatus(gameCode: string, status: string): Promise<void> {
    await update(ref(database, `games/${gameCode}`), {
      status,
      updatedAt: Date.now(),
    });
  }

  // Слушает изменения игроков в реальном времени
  static watchPlayers(
    gameCode: string,
    callback: (players: Player[]) => void
  ): () => void {
    const playersRef = ref(database, `games/${gameCode}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const playersObj = snapshot.val();
      const players = Object.entries(playersObj).map(([id, data]: [string, any]) => ({
        ...data,
        id,
      }));
      callback(players);
    });
    return unsubscribe;
  }

  // Слушает изменения игроков, скрывая роли других игроков
  static watchPlayersForPlayer(
    gameCode: string,
    currentPlayerId: string,
    callback: (players: Player[]) => void
  ): () => void {
    const playersRef = ref(database, `games/${gameCode}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const playersObj = snapshot.val();
      const players = Object.entries(playersObj).map(([id, data]: [string, any]) => {
        const player: Player = {
          ...data,
          id,
        };
        
        // Скрываем роль других игроков (показываем только свою)
        if (player.id !== currentPlayerId) {
          delete player.role;
        }
        
        return player;
      });
      callback(players);
    });
    return unsubscribe;
  }
}
