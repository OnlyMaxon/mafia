export interface RoulettePlayer {
  id: string;
  name: string;
  isAlive: boolean;
  order: number;
}

export interface RoulettePull {
  playerId: string;
  playerName: string;
  result: 'safe' | 'dead';
  chamber: number;
  timestamp: number;
}

export interface RouletteGame {
  id: string;
  hostId: string;
  gameCode: string;
  status: 'waiting' | 'playing' | 'finished';
  settings: {
    bullets: number;
  };
  bulletChambers: number[];
  currentChamber: number;
  players: Record<string, RoulettePlayer>;
  playerOrder: string[];
  currentPlayerIndex: number;
  lastPull: RoulettePull | null;
  winnerId: string | null;
  createdAt: number;
  updatedAt: number;
}
