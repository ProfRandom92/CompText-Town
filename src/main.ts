import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { VillageScene } from './scenes/VillageScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 384,
  height: 216,
  backgroundColor: '#1b1720',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, VillageScene],
};

new Phaser.Game(config);
