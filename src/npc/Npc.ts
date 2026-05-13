import Phaser from 'phaser';
import { NpcMemory, NpcMemorySnapshot } from './memory';
import { ReplayTimeline } from '../comptext/replayTimeline';
import { VillageAtmosphereState } from '../systems/TimeWeatherSystem';

export interface DialogueLine {
  speaker: string;
  text: string;
}

interface NpcAnchor {
  x: number;
  y: number;
}

export class Npc extends Phaser.Physics.Arcade.Sprite {
  readonly memory: NpcMemory;
  private readonly anchors: Record<string, NpcAnchor> = {
    workshop: { x: 342, y: 174 },
    market: { x: 382, y: 196 },
    lantern: { x: 268, y: 118 },
    home: { x: 338, y: 174 },
  };
  private currentAnchor: NpcAnchor = this.anchors.workshop;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly displayName: string, timeline: ReplayTimeline) {
    super(scene, x, y, 'npc-mira');
    this.memory = new NpcMemory(displayName, 8, timeline);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(20);
    this.currentAnchor = { x, y };
  }

  updateSchedule(state: VillageAtmosphereState) {
    const target = this.scheduleTarget(state);
    if (target !== this.currentAnchor) {
      this.currentAnchor = target;
    }

    const wander = state.phase === 'night' ? 1.5 : 7;
    const offsetX = Math.sin(this.scene.time.now / 1600) * wander;
    const offsetY = Math.cos(this.scene.time.now / 2100) * (wander * 0.45);
    this.x = Phaser.Math.Linear(this.x, target.x + offsetX, 0.015);
    this.y = Phaser.Math.Linear(this.y, target.y + offsetY, 0.015);
    this.setDepth(this.y + 18);
    this.setFlipX(Math.sin(this.scene.time.now / 1600) < 0);
  }

  talk(hasClay: boolean, state: VillageAtmosphereState): { lines: DialogueLine[]; memory: NpcMemorySnapshot } {
    const snapshot = this.memory.snapshot();
    if (snapshot.questState === 'cup-delivered') {
      const summary = `Mira remembered the delivered cup during ${state.phase} ${state.rainIntensity > 0.72 ? 'heavy rain' : 'soft rain'}.`;
      const memory = this.memory.remember(summary, `after-delivery-${state.phase}`);
      return {
        lines: [
          { speaker: this.displayName, text: this.memoryLineFor(state, `I keep your ${memory.deliveredItem ?? 'cup'} where the rain can sing into it.`) },
          { speaker: this.displayName, text: 'It makes the whole workshop feel less alone.' },
          { speaker: 'CompText whisper', text: 'Delivered item retained. Warmth gently brightened.' },
        ],
        memory,
      };
    }

    const actionTag = hasClay ? `gift-clay-${state.phase}` : `kind-visit-${state.phase}`;
    const summary = hasClay
      ? `Player brought river clay during ${state.phase} ${state.rainIntensity > 0.72 ? 'hard rain' : 'mist'} while Mira asked for a fired cup.`
      : `Mira asked for one fired cup during ${state.phase} as village rain shifted.`;
    const memory = this.memory.remember(summary, actionTag);
    const lines = hasClay
      ? [
          { speaker: this.displayName, text: this.memoryLineFor(state, 'That clay has a river-song in it. Could you shape and fire me one small cup?') },
          { speaker: 'CompText whisper', text: 'Weather and time folded into warm semantic shards.' },
        ]
      : [
          { speaker: this.displayName, text: this.memoryLineFor(state, 'Come in from the rain. If your hands are free, I need one fired cup for tea.') },
          { speaker: 'CompText whisper', text: 'Context retained. Request remains active beneath the weather.' },
        ];
    return { lines, memory };
  }

  receiveDelivery(itemName: string, state: VillageAtmosphereState): { lines: DialogueLine[]; memory: NpcMemorySnapshot } {
    const memory = this.memory.rememberDelivery(itemName, state.phase);
    return {
      lines: [
        { speaker: this.displayName, text: state.phase === 'night' ? 'Oh—still warm. A little moon caught in clay.' : 'Oh—still warm. You carried the kiln light all the way here.' },
        { speaker: this.displayName, text: 'I will remember this cup when the rain sounds lonely.' },
        { speaker: 'CompText whisper', text: 'Memory state updated: delivered fired cup; snapshot replayable.' },
      ],
      memory,
    };
  }

  positionForInteraction(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }

  private scheduleTarget(state: VillageAtmosphereState): NpcAnchor {
    if (state.phase === 'night') return this.anchors.home;
    if (state.phase === 'dusk') return this.anchors.lantern;
    if (state.rainIntensity > 0.76) return this.anchors.workshop;
    return this.anchors.market;
  }

  private memoryLineFor(state: VillageAtmosphereState, fallback: string): string {
    if (state.phase === 'night') return 'The village is going home now. Stay near the lanterns, yes?';
    if (state.rainIntensity > 0.78) return 'Listen—the roof is loud tonight. Even the clay seems to remember harder.';
    if (state.phase === 'dawn') return 'Morning rain makes every cup feel newly named.';
    return fallback;
  }
}
