import Phaser from 'phaser';
import { NpcMemory, NpcMemorySnapshot } from './memory';
import { ReplayTimeline } from '../comptext/replayTimeline';

export interface DialogueLine {
  speaker: string;
  text: string;
}

export class Npc extends Phaser.Physics.Arcade.Sprite {
  readonly memory: NpcMemory;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly displayName: string, timeline: ReplayTimeline) {
    super(scene, x, y, 'npc-mira');
    this.memory = new NpcMemory(displayName, 8, timeline);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(20);
  }

  talk(hasClay: boolean): { lines: DialogueLine[]; memory: NpcMemorySnapshot } {
    const actionTag = hasClay ? 'gift-clay' : 'kind-visit';
    const summary = hasClay
      ? 'Player brought river clay to Mira during the rainy evening workshop shift.'
      : 'Player checked on Mira while kiln embers made the rain glow orange.';
    const memory = this.memory.remember(summary, actionTag);
    const lines = hasClay
      ? [
          { speaker: this.displayName, text: 'This clay has a river-song in it. The kiln will remember your hands.' },
          { speaker: 'CompText whisper', text: 'Memory folded into warm semantic shards.' },
        ]
      : [
          { speaker: this.displayName, text: 'Come in from the rain. Even empty pockets can carry kindness.' },
          { speaker: 'CompText whisper', text: 'Context retained. Drift remains low.' },
        ];
    return { lines, memory };
  }
}
