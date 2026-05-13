import Phaser from 'phaser';
import { pixelPalette } from '../assets/pixelPalette';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createTexture('player', 12, 16, [
      '....3333....',
      '...366663...',
      '...611116...',
      '...166661...',
      '..22777722..',
      '..27777772..',
      '..27722772..',
      '...772277...',
      '...22..22...',
      '...22..22...',
      '...44..44...',
      '...44..44...',
      '...55..55...',
      '...55..55...',
      '..555..555..',
      '............',
    ]);
    this.createTexture('npc-mira', 12, 16, [
      '....9999....',
      '...966669...',
      '...611116...',
      '...166661...',
      '..aa8888aa..',
      '..a888888a..',
      '..a88aa88a..',
      '...888888...',
      '...88..88...',
      '...88..88...',
      '...bb..bb...',
      '...bb..bb...',
      '...55..55...',
      '...55..55...',
      '..555..555..',
      '............',
    ]);
    this.createTexture('clay-node', 12, 8, [
      '..cccccc....',
      '.c77777cc..',
      'c777c777c.',
      'c77ccc77c.',
      '.cc7777c..',
      '..cccccc...',
      '....cc.....',
      '............',
    ]);
    this.createTexture('pot', 10, 12, [
      '..cccc..',
      '.c7777c.',
      'c777777c',
      'c777777c',
      'c777777c',
      '.c7777c.',
      '..cccc..',
      '........',
    ]);
    this.scene.start('VillageScene');
  }

  private createTexture(key: string, width: number, height: number, rows: string[]) {
    const colors: Record<string, number> = {
      '1': 0xf3c7a1,
      '2': 0x39516a,
      '3': 0x6a4b3f,
      '4': 0x3d3046,
      '5': 0x2b2634,
      '6': 0x4c2f2f,
      '7': pixelPalette.clay,
      '8': 0x6f8e77,
      '9': 0x26384d,
      a: 0xd59b6a,
      b: 0x463445,
      c: 0xb97752,
    };
    const canvas = this.textures.createCanvas(key, width, height);
    if (!canvas) return;
    const context = canvas.getContext();
    rows.forEach((row, y) => {
      [...row].forEach((value, x) => {
        if (value === '.') return;
        context.fillStyle = Phaser.Display.Color.IntegerToColor(colors[value]).rgba;
        context.fillRect(x, y, 1, 1);
      });
    });
    canvas.refresh();
  }
}
