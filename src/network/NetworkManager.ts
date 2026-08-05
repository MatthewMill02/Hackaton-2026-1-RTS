import Peer, { type DataConnection } from 'peerjs';
import { MAX_PLAYERS, type PlayerId } from '@/shared/types';
import type {
  GameStartPayload,
  NetworkEventHandler,
  NetworkMessage,
  PlayerJoinedPayload,
} from '@/network/types';

type GameStartCallback = () => void;
type PlayerJoinedCallback = (playerId: PlayerId) => void;

export class NetworkManager {
  private peer: Peer | null = null;
  private connections: Map<PlayerId, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private localPlayerId: PlayerId = 0;
  private isHost = false;
  private nextPlayerId: PlayerId = 1;

  private messageHandlers: Map<string, NetworkEventHandler[]> = new Map();
  private onGameStartCallbacks: GameStartCallback[] = [];
  private onPlayerJoinedCallbacks: PlayerJoinedCallback[] = [];

  async host(): Promise<string> {
    this.isHost = true;
    this.localPlayerId = 0;
    this.nextPlayerId = 1;

    return new Promise((resolve, reject) => {
      this.peer = new Peer();

      this.peer.on('open', (id) => {
        resolve(id);
      });

      this.peer.on('error', (error) => {
        reject(error);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });
    });
  }

  async join(hostPeerId: string): Promise<void> {
    this.isHost = false;

    return new Promise((resolve, reject) => {
      this.peer = new Peer();

      this.peer.on('open', () => {
        const conn = this.peer!.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          this.hostConnection = conn;
          resolve();
        });

        conn.on('data', (data) => {
          this.handleMessage(data as NetworkMessage);
        });

        conn.on('error', (error) => {
          reject(error);
        });
      });

      this.peer.on('error', (error) => {
        reject(error);
      });
    });
  }

  send<T>(type: NetworkMessage['type'], payload: T, targetId?: PlayerId): void {
    const message: NetworkMessage<T> = {
      type,
      senderId: this.localPlayerId,
      timestamp: Date.now(),
      payload,
    };

    if (this.isHost) {
      if (targetId !== undefined) {
        this.connections.get(targetId)?.send(message);
      } else {
        this.broadcast(message);
      }
    } else {
      this.hostConnection?.send(message);
    }
  }

  broadcast<T>(message: NetworkMessage<T>): void {
    if (this.isHost) {
      for (const conn of this.connections.values()) {
        conn.send(message);
      }
    } else {
      this.hostConnection?.send(message);
    }
  }

  on<T>(type: string, handler: NetworkEventHandler<T>): void {
    const handlers = this.messageHandlers.get(type) ?? [];
    handlers.push(handler as NetworkEventHandler);
    this.messageHandlers.set(type, handlers);
  }

  off(type: string, handler: NetworkEventHandler): void {
    const handlers = this.messageHandlers.get(type) ?? [];
    this.messageHandlers.set(
      type,
      handlers.filter((h) => h !== handler),
    );
  }

  onGameStart(callback: GameStartCallback): void {
    this.onGameStartCallbacks.push(callback);
  }

  onPlayerJoined(callback: PlayerJoinedCallback): void {
    this.onPlayerJoinedCallbacks.push(callback);
  }

  getLocalPlayerId(): PlayerId {
    return this.localPlayerId;
  }

  getPlayerCount(): number {
    return this.connections.size + (this.isHost ? 1 : 0);
  }

  isLocalHost(): boolean {
    return this.isHost;
  }

  disconnect(): void {
    for (const conn of this.connections.values()) {
      conn.close();
    }
    this.connections.clear();
    this.hostConnection?.close();
    this.hostConnection = null;
    this.peer?.destroy();
    this.peer = null;
    this.messageHandlers.clear();
    this.onGameStartCallbacks = [];
    this.onPlayerJoinedCallbacks = [];
  }

  startGame(): void {
    if (!this.isHost) return;

    const payload: GameStartPayload = {
      players: Array.from({ length: this.getPlayerCount() }, (_, i) => i as PlayerId),
      seed: Date.now(),
    };

    this.send('game_start', payload);
    this.emitGameStart();
  }

  private handleIncomingConnection(conn: DataConnection): void {
    if (this.getPlayerCount() >= MAX_PLAYERS) {
      conn.close();
      return;
    }

    const playerId = this.nextPlayerId as PlayerId;
    this.nextPlayerId = (this.nextPlayerId + 1) as PlayerId;
    this.connections.set(playerId, conn);

    conn.on('data', (data) => {
      const message = data as NetworkMessage;
      this.handleMessage(message);
      this.relayToOthers(playerId, message);
    });

    conn.on('close', () => {
      this.connections.delete(playerId);
    });

    const joinedPayload: PlayerJoinedPayload = {
      playerId,
      playerCount: this.getPlayerCount(),
    };

    this.send('player_joined', joinedPayload, playerId);
    this.onPlayerJoinedCallbacks.forEach((cb) => cb(playerId));

    if (this.getPlayerCount() >= MAX_PLAYERS) {
      this.startGame();
    }
  }

  private handleMessage(message: NetworkMessage): void {
    switch (message.type) {
      case 'player_joined': {
        const payload = message.payload as PlayerJoinedPayload;
        this.localPlayerId = payload.playerId;
        break;
      }
      case 'game_start':
        this.emitGameStart();
        break;
    }

    const handlers = this.messageHandlers.get(message.type) ?? [];
    handlers.forEach((handler) => handler(message));
  }

  private emitGameStart(): void {
    this.onGameStartCallbacks.forEach((cb) => cb());
  }

  private relayToOthers(senderId: PlayerId, message: NetworkMessage): void {
    if (!this.isHost) return;

    for (const [playerId, conn] of this.connections) {
      if (playerId !== senderId) {
        conn.send(message);
      }
    }
  }
}
