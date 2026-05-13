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
    const snapshot = this.memory.snapshot();
    if (snapshot.questState === 'cup-delivered') {
      const memory = this.memory.remember('Mira admired the delivered cup and set it beside her window herbs.', 'after-delivery-visit');
      return {
        lines: [
          { speaker: this.displayName, text: `I keep your ${memory.deliveredItem ?? 'cup'} where the rain can sing into it.` },
          { speaker: this.displayName, text: 'It makes the whole workshop feel less alone.' },
          { speaker: 'CompText whisper', text: 'Delivered item retained. Mira response shifted.' },
        ],
        memory,
      };
    }

    const actionTag = hasClay ? 'gift-clay' : 'kind-visit';
    const summary = hasClay
      ? 'Player brought river clay while Mira asked for one fired cup for her windowsill tea.'
      : 'Mira asked the player to make one fired cup before the rain grows colder.';
    const memory = this.memory.remember(summary, actionTag);
    const lines = hasClay
      ? [
          { speaker: this.displayName, text: 'That clay has a river-song in it. Could you shape and fire me one small cup?' },
          { speaker: 'CompText whisper', text: 'Quest intent folded into warm semantic shards.' },
        ]
      : [
          { speaker: this.displayName, text: 'Come in from the rain. If your hands are free, I need one fired cup for tea.' },
          { speaker: 'CompText whisper', text: 'Context retained. Request remains active.' },
        ];
    return { lines, memory };
  }

  receiveDelivery(itemName: string): { lines: DialogueLine[]; memory: NpcMemorySnapshot } {
    const memory = this.memory.rememberDelivery(itemName);
    return {
      lines: [
        { speaker: this.displayName, text: 'Oh—still warm. You carried the kiln light all the way here.' },
        { speaker: this.displayName, text: 'I will remember this cup when the rain sounds lonely.' },
        { speaker: 'CompText whisper', text: 'Memory state updated: delivered fired cup.' },
      ],
      memory,
    };
  }
}
