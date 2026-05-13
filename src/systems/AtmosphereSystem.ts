import Phaser from 'phaser';
import { VillageAtmosphereState } from './TimeWeatherSystem';

interface ShimmerPuddle {
  sprite: Phaser.GameObjects.Sprite;
  glint: Phaser.GameObjects.Rectangle;
  seed: number;
}

interface SmokeParticle {
  shape: Phaser.GameObjects.Arc;
  originX: number;
  originY: number;
  seed: number;
}

export class AtmosphereSystem {
  private nightVeil!: Phaser.GameObjects.Rectangle;
  private fogBands: Phaser.GameObjects.Rectangle[] = [];
  private puddles: ShimmerPuddle[] = [];
  private smoke: SmokeParticle[] = [];
  private wildlife: Phaser.GameObjects.Text[] = [];
  private memoryMotes: Phaser.GameObjects.Arc[] = [];
  private workshopWarmth!: Phaser.GameObjects.Rectangle;

  constructor(private readonly scene: Phaser.Scene) {}

  create(width: number, height: number, puddleSprites: Phaser.GameObjects.Sprite[]) {
    this.nightVeil = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x10141d, 0.24).setDepth(70);
    this.workshopWarmth = this.scene.add.rectangle(79, 88, 86, 45, 0xf5b56b, 0.08).setDepth(71);
    this.scene.add.circle(79, 91, 58, 0xf5b56b, 0.045).setDepth(69);

    for (let i = 0; i < 4; i += 1) {
      this.fogBands.push(
        this.scene.add.rectangle(width / 2, 54 + i * 46, width * 0.9, 10, 0xd8d6c2, 0.08).setDepth(74),
      );
    }

    this.puddles = puddleSprites.map((sprite, index) => ({
      sprite,
      glint: this.scene.add.rectangle(sprite.x + 1, sprite.y - 1, 10, 1, 0xf7e7c1, 0.22).setDepth(4),
      seed: index * 1.7,
    }));

    [
      { x: 46, y: 46 },
      { x: 358, y: 43 },
      { x: 111, y: 47 },
    ].forEach((origin, index) => {
      for (let puff = 0; puff < 3; puff += 1) {
        this.smoke.push({
          shape: this.scene.add.circle(origin.x, origin.y, 3 + puff, 0xc9c1b4, 0.14).setDepth(75),
          originX: origin.x,
          originY: origin.y,
          seed: index * 2 + puff * 0.8,
        });
      }
    });

    for (let i = 0; i < 14; i += 1) {
      this.memoryMotes.push(
        this.scene.add.circle(35 + (i * 31) % width, 45 + (i * 47) % (height - 72), 1, i % 3 === 0 ? 0xf5b56b : 0xb9cfa8, 0.18).setDepth(76),
      );
    }

    [
      { x: 172, y: 48, glyph: '·' },
      { x: 302, y: 134, glyph: '⌁' },
      { x: 228, y: 72, glyph: 'ˇ' },
    ].forEach(({ x, y, glyph }) => {
      this.wildlife.push(
        this.scene.add.text(x, y, glyph, { fontFamily: 'monospace', fontSize: '9px', color: '#b9cfa8' }).setDepth(76),
      );
    });
  }

  update(state: VillageAtmosphereState) {
    const now = this.scene.time.now;
    this.nightVeil.setAlpha(state.lightAlpha);
    this.workshopWarmth.setAlpha(state.phase === 'night' || state.phase === 'dusk' ? 0.14 : 0.06);

    this.fogBands.forEach((band, index) => {
      band.x = 192 + Math.sin(now / 6200 + index) * 38;
      band.setAlpha(state.fogAlpha * (0.42 + index * 0.08));
    });

    this.puddles.forEach(({ sprite, glint, seed }) => {
      const shimmer = Math.sin(now / 280 + seed);
      sprite.setAlpha(0.46 + state.rainIntensity * 0.24 + shimmer * 0.08);
      sprite.setScale(1 + Math.sin(now / 420 + seed) * 0.035, 1);
      glint.x = sprite.x + Math.sin(now / 520 + seed) * 3;
      glint.setAlpha((state.phase === 'night' ? 0.36 : 0.18) + state.rainIntensity * 0.12 + Math.max(0, shimmer) * 0.12);
      glint.setScale(0.7 + Math.max(0, shimmer) * 0.55, 1);
    });

    this.smoke.forEach((particle) => {
      const drift = (now / 90 + particle.seed * 28) % 42;
      particle.shape.x = particle.originX + Math.sin(now / 900 + particle.seed) * 7;
      particle.shape.y = particle.originY - drift;
      particle.shape.setAlpha(Math.max(0, 0.17 - drift / 280));
    });

    this.memoryMotes.forEach((mote, index) => {
      mote.x += Math.sin(now / 900 + index) * 0.018;
      mote.y += Math.cos(now / 1100 + index) * 0.014;
      mote.setAlpha((state.phase === 'night' ? 0.3 : 0.16) + Math.max(0, Math.sin(now / 750 + index)) * 0.18);
    });

    this.wildlife.forEach((glyph, index) => {
      glyph.setVisible(state.phase !== 'night' || index === 1);
      glyph.y += Math.sin(now / 500 + index) * 0.015;
      glyph.setAlpha(state.phase === 'night' ? 0.32 : 0.58 + Math.sin(now / 700 + index) * 0.18);
    });
  }
}
