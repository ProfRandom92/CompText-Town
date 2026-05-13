import Phaser from 'phaser';

export class RainSystem {
  private particles: Phaser.GameObjects.Rectangle[] = [];
  private intensity = 0.55;
  private width = 0;
  private height = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  create(width: number, height: number) {
    this.width = width;
    this.height = height;
    for (let i = 0; i < 96; i += 1) {
      const drop = this.scene.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        1,
        Phaser.Math.Between(3, 7),
        0x8aa0ba,
        0.32,
      );
      drop.setDepth(80);
      this.particles.push(drop);
    }
  }

  setIntensity(intensity: number) {
    this.intensity = Phaser.Math.Clamp(intensity, 0.15, 1);
  }

  update() {
    const camera = this.scene.cameras.main;
    const activeDrops = Math.floor(this.particles.length * this.intensity);
    for (const [index, drop] of this.particles.entries()) {
      drop.setVisible(index < activeDrops);
      if (!drop.visible) continue;
      drop.setAlpha(0.2 + this.intensity * 0.32);
      drop.y += 2.2 + this.intensity * 2.6;
      drop.x -= 0.55 + this.intensity * 0.7;
      if (drop.y > camera.scrollY + camera.height + 8) {
        drop.y = camera.scrollY - 8;
        drop.x = Phaser.Math.Clamp(camera.scrollX + Phaser.Math.Between(0, camera.width), 0, this.width);
      }
    }
  }
}
