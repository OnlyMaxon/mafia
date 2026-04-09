export type Role = 'mafia' | 'sheriff' | 'doctor' | 'maniac' | 'prostitute' | 'civilian';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  isAlive: boolean;
  isReady: boolean;
}

export interface GameRoles {
  mafia: number;
  sheriff: number;
  doctor: number;
  maniac: number;
  prostitute: number;
  civilian: number;
}

export interface GameState {
  id: string;
  hostId: string;
  gameCode: string;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  players: Player[];
  roles: GameRoles;
  currentPhase: 'day' | 'night';
  round: number;
  createdAt: number;
  updatedAt: number;
}

export interface GameSettings {
  mafia: number;
  sheriff: number;
  doctor: number;
  maniac: number;
  prostitute: number;
  civilian: number;
}
