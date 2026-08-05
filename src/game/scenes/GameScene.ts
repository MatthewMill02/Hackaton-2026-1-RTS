import Phaser from 'phaser';
import { NetworkManager } from '@/network/NetworkManager';
import { UnitController } from '@/units/UnitController';
import { PLAYER_COLORS } from '@/shared/types';

interface GameSceneData {
  networkManager: NetworkManager;
}

export class GameScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private unitController!: UnitController;
  private localPlayerId!: number;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.networkManager = data.networkManager;
    this.localPlayerId = this.networkManager.getLocalPlayerId();
  }

  create(): void {
    this.drawGrid();
    this.createPlayerIndicator();

    this.unitController = new UnitController(this, this.networkManager);
    this.unitController.setupInput();

    this.add
      .text(16, 16, 'LPM — zaznacz | PPM — ruch | ESC — menu', {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Arial, sans-serif',
      })
      .setScrollFactor(0);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.networkManager.disconnect();
      this.scene.start('MenuScene');
    });
  }

  update(): void {
    this.unitController.update();
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x2a2a3e, 0.5);

    const { width, height } = this.scale;
    const tileSize = 64;

    for (let x = 0; x <= width; x += tileSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += tileSize) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  private createPlayerIndicator(): void {
    const color = PLAYER_COLORS[this.localPlayerId as 0 | 1 | 2 | 3] ?? 0xffffff;
    const colorHex = `#${color.toString(16).padStart(6, '0')}`;

    this.add
      .text(16, this.scale.height - 40, `Gracz ${this.localPlayerId + 1}`, {
        fontSize: '16px',
        color: colorHex,
        fontFamily: 'Arial, sans-serif',
      })
      .setScrollFactor(0);
  }
}
