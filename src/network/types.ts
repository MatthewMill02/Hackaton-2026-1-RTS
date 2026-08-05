import type { PlayerId, Vector2 } from '@/shared/types';

export type NetworkMessageType =
  | 'player_joined'
  | 'game_start'
  | 'unit_move'
  | 'unit_spawn'
  | 'sync_state';

export interface NetworkMessage<T = unknown> {
  type: NetworkMessageType;
  senderId: PlayerId;
  timestamp: number;
  payload: T;
}

export interface UnitMovePayload {
  unitId: string;
  target: Vector2;
}

export interface UnitSpawnPayload {
  unitId: string;
  ownerId: PlayerId;
  position: Vector2;
}

export interface GameStartPayload {
  players: PlayerId[];
  seed: number;
}

export interface PlayerJoinedPayload {
  playerId: PlayerId;
  playerCount: number;
}

export type NetworkEventHandler<T = unknown> = (message: NetworkMessage<T>) => void;
