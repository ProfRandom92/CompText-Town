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

    this.createTexture('npc-ori', 12, 16, [
      '....6666....',
      '...6cccc6...',
      '...c1111c...',
      '...1cccc1...',
      '..99888899..',
      '..98888889..',
      '..98899889..',
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
    this.createTexture('npc-luma', 12, 16, [
      '....dddd....',
      '...d9999d...',
      '...911119...',
      '...199991...',
      '..aa7777aa..',
      '..a777777a..',
      '..a77aa77a..',
      '...777777...',
      '...77..77...',
      '...77..77...',
      '...44..44...',
      '...44..44...',
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
    this.createTexture('pot', 8, 8, [
      '..cccc..',
      '.c7777c.',
      'c777777c',
      'c777777c',
      '.c7777c.',
      '..cccc..',
      '........',
      '........',
    ]);
    this.createTexture('wet-cup', 8, 8, [
      '..cccc..',
      '.c7777c.',
      'c777777c',
      'c777777c',
      '.c7777c.',
      '..cccc..',
      '........',
      '........',
    ]);
    this.createTexture('fired-cup', 8, 8, [
      '..dddd..',
      '.dffffd.',
      'dffccffd',
      'dffccffd',
      '.dffffd.',
      '..dddd..',
      '........',
      '........',
    ]);
    this.createTexture('kiln', 22, 24, [
      '....6666666666....',
      '..66bbbbbbbb66....',
      '.6bb66666666bb6...',
      '6bb644444446bb6..',
      '6b644ffff446b6...',
      '6b64fddddf46b6...',
      '6b64fddddf46b6...',
      '6b644ffff446b6...',
      '6bb644444446bb6..',
      '.6bb66666666bb6...',
      '..666666666666....',
      '...6b6....6b6.....',
    ]);
    this.createTexture('lantern-post', 9, 22, [
      '....6....',
      '....6....',
      '...666...',
      '..6dd6...',
      '..6dd6...',
      '...66....',
      '....6....',
      '....6....',
      '....6....',
      '....6....',
      '...666...',
    ]);
    this.createTexture('puddle', 16, 6, [
      '....999999......',
      '..9999999999....',
      '.999999999999...',
      '..9999999999....',
      '....999999......',
      '................',
    ]);
    this.createTexture('pottery-wheel', 16, 12, [
      '....bbbb....',
      '..bb7777bb..',
      '.b7777777b..',
      '.b7777777b..',
      '..bb7777bb..',
      '....bbbb....',
      '.....66.....',
      '....6666....',
      '...6bbbb6...',
      '...6bbbb6...',
      '............',
      '............',
    ]);
    this.createTexture('shelf-pots', 18, 16, [
      '666666666666666666',
      '6....cc....cc....6',
      '6...c77c..c77c...6',
      '6....cc....cc....6',
      '666666666666666666',
      '6..cc....cc....cc6',
      '6.c77c..c77c..c776',
      '6..cc....cc....cc6',
      '666666666666666666',
      '..................',
    ]);
    this.createTexture('rolled-rug', 24, 10, [
      '...bbbbbbbbbbbbbbbb...',
      '..b888888888888888b..',
      '.b88aaaaaaaaaaaa88b.',
      '.b88aaaaaaaaaaaa88b.',
      '..b888888888888888b..',
      '...bbbbbbbbbbbbbbbb...',
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
      d: pixelPalette.lantern,
      f: pixelPalette.kiln,
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
