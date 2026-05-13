import Phaser from 'phaser';

export class RainSystem {
  private particles: Phaser.GameObjects.Rectangle[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  create(width: number, height: number) {
    for (let i = 0; i < 72; i += 1) {
      const drop = this.scene.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        1,
        Phaser.Math.Between(3, 6),
        0x8aa0ba,
        0.32,
      );
      drop.setDepth(80);
      this.particles.push(drop);
    }
  }

  update() {
    const camera = this.scene.cameras.main;
    for (const drop of this.particles) {
      drop.y += 3.2;
      drop.x -= 0.8;
      if (drop.y > camera.scrollY + camera.height + 8) {
        drop.y = camera.scrollY - 8;
        drop.x = camera.scrollX + Phaser.Math.Between(0, camera.width);
      }
    }
  }
}
