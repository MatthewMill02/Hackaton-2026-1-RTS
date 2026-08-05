import Phaser from 'phaser';
import { NetworkManager } from '@/network/NetworkManager';
import type { UnitMovePayload } from '@/network/types';
import { Unit } from '@/units/Unit';

export class UnitController {
  private scene: Phaser.Scene;
  private network: NetworkManager;
  private units: Map<string, Unit> = new Map();
  private selectedUnits: Unit[] = [];

  constructor(scene: Phaser.Scene, network: NetworkManager) {
    this.scene = scene;
    this.network = network;

    this.spawnLocalUnit();
    this.setupNetworkListeners();
  }

  setupInput(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.handleSelection(pointer);
      } else if (pointer.rightButtonDown()) {
        this.handleMoveCommand(pointer);
      }
    });
  }

  update(): void {
    for (const unit of this.units.values()) {
      unit.update(this.scene.game.loop.delta);
    }
  }

  getUnits(): Unit[] {
    return Array.from(this.units.values());
  }

  private spawnLocalUnit(): void {
    const playerId = this.network.getLocalPlayerId();
    const spawnPositions = [
      { x: 200, y: 200 },
      { x: 1080, y: 200 },
      { x: 200, y: 520 },
      { x: 1080, y: 520 },
    ];

    const position = spawnPositions[playerId] ?? { x: 640, y: 360 };
    const unitId = `unit-${playerId}-0`;

    const unit = new Unit(this.scene, {
      id: unitId,
      ownerId: playerId,
      position,
    });
    unit.createSelectionRing(this.scene);
    this.units.set(unitId, unit);
  }

  private setupNetworkListeners(): void {
    this.network.on<UnitMovePayload>('unit_move', (message) => {
      if (message.senderId === this.network.getLocalPlayerId()) return;

      const { unitId, target } = message.payload;
      const unit = this.units.get(unitId);
      unit?.moveTo(target);
    });
  }

  private handleSelection(pointer: Phaser.Input.Pointer): void {
    this.clearSelection();

    const hitObjects = this.scene.input.hitTestPointer(pointer);
    for (const obj of hitObjects) {
      const unit = (obj as Phaser.GameObjects.GameObject).getData('unit') as Unit | undefined;
      if (unit && unit.ownerId === this.network.getLocalPlayerId()) {
        unit.select();
        this.selectedUnits.push(unit);
        return;
      }
    }
  }

  private handleMoveCommand(pointer: Phaser.Input.Pointer): void {
    if (this.selectedUnits.length === 0) return;

    const target = { x: pointer.worldX, y: pointer.worldY };

    for (const unit of this.selectedUnits) {
      unit.moveTo(target);

      this.network.send<UnitMovePayload>('unit_move', {
        unitId: unit.id,
        target,
      });
    }
  }

  private clearSelection(): void {
    for (const unit of this.selectedUnits) {
      unit.deselect();
    }
    this.selectedUnits = [];
  }
}
