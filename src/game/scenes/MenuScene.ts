import Phaser from 'phaser';
import { NetworkManager } from '@/network/NetworkManager';
import { MAX_PLAYERS } from '@/shared/types';

export class MenuScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private statusText!: Phaser.GameObjects.Text;
  private peerIdText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.networkManager = new NetworkManager();

    const cx = this.scale.width / 2;

    this.add
      .text(cx, 120, 'RTS 2D Multiplayer', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.add
      .text(cx, 180, `Do ${MAX_PLAYERS} graczy`, {
        fontSize: '20px',
        color: '#aaaaaa',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.createButton(cx, 320, 'Utwórz grę (Host)', () => this.onHostGame());
    this.createButton(cx, 400, 'Dołącz do gry', () => this.onJoinGame());

    this.statusText = this.add
      .text(cx, 520, 'Wybierz opcję, aby rozpocząć', {
        fontSize: '16px',
        color: '#888888',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.peerIdText = this.add
      .text(cx, 560, '', {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#333355',
        padding: { x: 24, y: 12 },
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#444477' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#333355' }));
    button.on('pointerdown', onClick);

    return button;
  }

  private async onHostGame(): Promise<void> {
    this.setStatus('Tworzenie gry...');

    try {
      const peerId = await this.networkManager.host();
      this.peerIdText.setText(`Twój ID: ${peerId} — udostępnij go innym graczom`);
      this.setStatus('Oczekiwanie na graczy...');

      this.networkManager.onPlayerJoined((playerId) => {
        this.setStatus(`Gracz ${playerId + 1} dołączył (${this.networkManager.getPlayerCount()}/${MAX_PLAYERS})`);
      });

      this.networkManager.onGameStart(() => {
        this.scene.start('GameScene', { networkManager: this.networkManager });
      });
    } catch (error) {
      this.setStatus(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    }
  }

  private async onJoinGame(): Promise<void> {
    const hostId = window.prompt('Podaj ID hosta:');
    if (!hostId) return;

    this.setStatus('Łączenie...');

    try {
      await this.networkManager.join(hostId);
      this.setStatus('Połączono! Oczekiwanie na start gry...');

      this.networkManager.onGameStart(() => {
        this.scene.start('GameScene', { networkManager: this.networkManager });
      });
    } catch (error) {
      this.setStatus(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    }
  }

  private setStatus(message: string): void {
    this.statusText.setText(message);
  }
}
