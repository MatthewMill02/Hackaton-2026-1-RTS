import Phaser from 'phaser';
import { createGameConfig } from '@/game/GameConfig';

const game = new Phaser.Game(createGameConfig('game-container'));

export default game;
