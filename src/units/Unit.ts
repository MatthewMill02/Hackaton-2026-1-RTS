import Phaser from 'phaser';
import type { PlayerId, Vector2 } from '@/shared/types';
import { PLAYER_COLORS } from '@/shared/types';

export interface UnitConfig {
  id: string;
  ownerId: PlayerId;
  position: Vector2;
  radius?: number;
  speed?: number;
}

export class Unit {
  readonly id: string;
  readonly ownerId: PlayerId;
  readonly sprite: Phaser.GameObjects.Arc;

  private speed: number;
  private target: Vector2 | null = null;
  private isSelected = false;
  private selectionRing: Phaser.GameObjects.Arc | null = null;

  constructor(scene: Phaser.Scene, config: UnitConfig) {
    this.id = config.id;
    this.ownerId = config.ownerId;
    this.speed = config.speed ?? 150;

    const color = PLAYER_COLORS[config.ownerId] ?? 0xffffff;
    const radius = config.radius ?? 16;

    this.sprite = scene.add.circle(config.position.x, config.position.y, radius, color);
    this.sprite.setStrokeStyle(2, 0x000000, 0.5);
    this.sprite.setData('unit', this);
  }

  moveTo(target: Vector2): void {
    this.target = { ...target };
  }

  select(): void {
    this.isSelected = true;
    this.selectionRing?.setVisible(true);
  }

  deselect(): void {
    this.isSelected = false;
    this.selectionRing?.setVisible(false);
  }

  getIsSelected(): boolean {
    return this.isSelected;
  }

  getPosition(): Vector2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  createSelectionRing(scene: Phaser.Scene): void {
    const radius = (this.sprite as Phaser.GameObjects.Arc).radius + 6;
    this.selectionRing = scene.add.circle(this.sprite.x, this.sprite.y, radius);
    this.selectionRing.setStrokeStyle(2, 0xffffff, 0.8);
    this.selectionRing.setFillStyle(0xffffff, 0);
    this.selectionRing.setVisible(false);
    this.selectionRing.setDepth(this.sprite.depth - 1);
  }

  update(delta: number): void {
    if (this.selectionRing) {
      this.selectionRing.setPosition(this.sprite.x, this.sprite.y);
    }

    if (!this.target) return;

    const dx = this.target.x - this.sprite.x;
    const dy = this.target.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
      this.sprite.setPosition(this.target.x, this.target.y);
      this.target = null;
      return;
    }

    const moveDistance = (this.speed * delta) / 1000;
    const ratio = Math.min(moveDistance / distance, 1);

    this.sprite.x += dx * ratio;
    this.sprite.y += dy * ratio;
  }

  destroy(): void {
    this.selectionRing?.destroy();
    this.sprite.destroy();
  }
}
