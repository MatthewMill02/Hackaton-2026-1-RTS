export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const MAX_PLAYERS = 4;

export const PLAYER_COLORS = [
  0x4a90d9, // niebieski
  0xd94a4a, // czerwony
  0x4ad94a, // zielony
  0xd9d94a, // żółty
] as const;

export type PlayerId = 0 | 1 | 2 | 3;

export interface PlayerInfo {
  id: PlayerId;
  name: string;
  isHost: boolean;
}

export interface Vector2 {
  x: number;
  y: number;
}
