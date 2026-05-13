import Phaser from 'phaser';
import { ReplayTimeline } from '../comptext/replayTimeline';
import { ItemId } from '../systems/InventorySystem';
import { VillageAtmosphereState } from '../systems/TimeWeatherSystem';
import { NpcMemory, NpcMemorySaveState, NpcMemorySnapshot, VillagerQuestState } from './memory';

export interface DialogueLine {
  speaker: string;
  text: string;
}

interface NpcAnchor {
  x: number;
  y: number;
}

export interface VillagerProfile {
  id: string;
  displayName: string;
  texture: string;
  warmthSeed: number;
  preference: ItemId;
  requestLabel: string;
  homeLine: string;
  giftLine: string;
  fulfilledLine: string;
  anchors: Record<string, NpcAnchor>;
  questState: VillagerQuestState;
}

export const VILLAGER_PROFILES: VillagerProfile[] = [
  {
    id: 'mira',
    displayName: 'Mira',
    texture: 'npc-mira',
    warmthSeed: 8,
    preference: 'firedCup',
    requestLabel: 'one fired cup for tea',
    homeLine: 'Come in from the rain. If your hands are free, I need one fired cup for tea.',
    giftLine: 'Oh—still warm. You carried the kiln light all the way here.',
    fulfilledLine: 'I keep your cup where the rain can sing into it.',
    questState: 'requesting-cup',
    anchors: {
      workshop: { x: 342, y: 174 },
      market: { x: 382, y: 196 },
      lantern: { x: 268, y: 118 },
      home: { x: 338, y: 174 },
    },
  },
  {
    id: 'ori',
    displayName: 'Ori',
    texture: 'npc-ori',
    warmthSeed: 4,
    preference: 'riverClay',
    requestLabel: 'river clay for repairing a roof charm',
    homeLine: 'I am mending the rain charm above my door. One palm of river clay would help it remember its shape.',
    giftLine: 'This clay smells like the bank after thunder. I will press it into the charm before dusk.',
    fulfilledLine: 'The roof charm held through the last shower. Your clay is in its little heart.',
    questState: 'requesting-gift',
    anchors: {
      workshop: { x: 236, y: 133 },
      market: { x: 406, y: 206 },
      lantern: { x: 146, y: 127 },
      home: { x: 206, y: 154 },
    },
  },
  {
    id: 'luma',
    displayName: 'Luma',
    texture: 'npc-luma',
    warmthSeed: 12,
    preference: 'wetCup',
    requestLabel: 'an unfired cup to press with moonleaf',
    homeLine: 'Before the kiln hardens everything, could I borrow one soft cup? I want to press a moonleaf into its side.',
    giftLine: 'Careful, it still holds your fingerprints. I will return its shape as a blessing.',
    fulfilledLine: 'Your soft cup kept the moonleaf mark. It makes the shelf look like a small spell.',
    questState: 'requesting-gift',
    anchors: {
      workshop: { x: 118, y: 134 },
      market: { x: 384, y: 190 },
      lantern: { x: 266, y: 98 },
      home: { x: 116, y: 130 },
    },
  },
];

export class Npc extends Phaser.Physics.Arcade.Sprite {
  readonly memory: NpcMemory;
  private currentAnchor: NpcAnchor;
  private moodGlyph: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly profile: VillagerProfile,
    timeline: ReplayTimeline,
    save?: NpcMemorySaveState,
  ) {
    super(scene, x, y, profile.texture);
    this.memory = new NpcMemory(profile.displayName, profile.warmthSeed, timeline, save);
    if (!save) this.memory.setQuestState(profile.questState);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(20);
    this.moodGlyph = scene.add.text(x, y - 18, '…', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f7e7c1',
    }).setOrigin(0.5).setDepth(42).setAlpha(0.45);
    this.currentAnchor = { x, y };
  }

  get id() {
    return this.profile.id;
  }

  get displayName() {
    return this.profile.displayName;
  }

  updateSchedule(state: VillageAtmosphereState) {
    const target = this.scheduleTarget(state);
    if (target !== this.currentAnchor) this.currentAnchor = target;

    const wander = state.phase === 'night' ? 1.5 : 7;
    const offsetX = Math.sin(this.scene.time.now / (1500 + this.profile.id.length * 80)) * wander;
    const offsetY = Math.cos(this.scene.time.now / (2100 + this.profile.id.length * 60)) * (wander * 0.45);
    this.x = Phaser.Math.Linear(this.x, target.x + offsetX, 0.015);
    this.y = Phaser.Math.Linear(this.y, target.y + offsetY, 0.015);
    const idleBreath = Math.sin(this.scene.time.now / (360 + this.profile.warmthSeed * 13));
    this.setDepth(this.y + 18);
    this.setScale(1 + idleBreath * 0.018, 1 - idleBreath * 0.012);
    this.setTint(this.memory.snapshot().relationship >= 40 ? 0xfff1cf : 0xffffff);
    this.setFlipX(Math.sin(this.scene.time.now / 1600) < 0);
    this.updateMoodGlyph(state);
  }

  talk(hasPreferredGift: boolean, state: VillageAtmosphereState): { lines: DialogueLine[]; memory: NpcMemorySnapshot } {
    const snapshot = this.memory.snapshot();
    const fulfilled = snapshot.questState === 'cup-delivered' || snapshot.questState === 'gift-delivered';
    if (fulfilled) {
      const summary = `${this.displayName} recalled ${snapshot.deliveredItem ?? 'a gift'} during ${state.phase} ${state.rainIntensity > 0.72 ? 'heavy rain' : 'soft rain'}.`;
      const memory = this.memory.remember(summary, `remember-weather-${state.phase}`, state.phase);
      return {
        lines: [
          { speaker: this.displayName, text: this.relationshipLine(state, this.profile.fulfilledLine, memory) },
          { speaker: this.displayName, text: memory.relationship >= 40 ? 'You are becoming part of how this village remembers itself.' : 'I am still learning the shape of your kindness.' },
          { speaker: 'CompText whisper', text: `Memory echo replayable: ${memory.replayEcho}` },
        ],
        memory,
      };
    }

    const actionTag = hasPreferredGift ? `gift-${this.profile.preference}-${state.phase}` : `kind-visit-${state.phase}`;
    const summary = hasPreferredGift
      ? `Player carried ${this.profile.preference} while ${this.displayName} asked for ${this.profile.requestLabel} during ${state.phase} rain.`
      : `${this.displayName} asked for ${this.profile.requestLabel} during ${state.phase}; previous warmth was ${snapshot.warmthLabel}.`;
    const memory = this.memory.remember(summary, actionTag, state.phase);
    return {
      lines: [
        { speaker: this.displayName, text: this.relationshipLine(state, this.profile.homeLine, memory) },
        { speaker: 'CompText whisper', text: `Clustered: ${memory.memoryClusters.join(', ') || 'first promise'}; warmth ${memory.warmthLabel}.` },
      ],
      memory,
    };
  }

  receiveDelivery(itemName: string, state: VillageAtmosphereState): { lines: DialogueLine[]; memory: NpcMemorySnapshot } {
    const memory = this.memory.rememberDelivery(itemName, state.phase);
    return {
      lines: [
        { speaker: this.displayName, text: state.phase === 'night' ? `${this.profile.giftLine} The night makes it feel secret.` : this.profile.giftLine },
        { speaker: this.displayName, text: 'I will remember this when the rain sounds lonely.' },
        { speaker: 'CompText whisper', text: 'Relationship graph updated; compressed archive saved.' },
      ],
      memory,
    };
  }

  private updateMoodGlyph(state: VillageAtmosphereState) {
    const memory = this.memory.snapshot();
    const glyph = memory.deliveredItem ? '♡' : state.rainIntensity > 0.76 ? '☂' : memory.relationship >= 18 ? '♪' : '…';
    this.moodGlyph.setText(glyph);
    this.moodGlyph.setPosition(this.x, this.y - 17 + Math.sin(this.scene.time.now / 520 + this.profile.warmthSeed) * 1.3);
    this.moodGlyph.setDepth(this.y + 38);
    this.moodGlyph.setAlpha(0.26 + Math.sin(this.scene.time.now / 760 + this.profile.warmthSeed) * 0.12 + (memory.relationship / 100) * 0.28);
  }

  positionForInteraction(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }

  private scheduleTarget(state: VillageAtmosphereState): NpcAnchor {
    if (state.phase === 'night') return this.profile.anchors.home;
    if (state.phase === 'dusk') return this.profile.anchors.lantern;
    if (state.rainIntensity > 0.76) return this.profile.anchors.workshop;
    return this.profile.anchors.market;
  }

  private relationshipLine(state: VillageAtmosphereState, fallback: string, memory: NpcMemorySnapshot): string {
    if (state.phase === 'night') return memory.relationship >= 40 ? 'You came back under the lanterns. I thought you might.' : 'The village is going home now. Stay near the lanterns, yes?';
    if (state.rainIntensity > 0.78) return memory.relationship >= 40 ? 'Listen—the roof is loud, but I can still hear your earlier kindness.' : 'Listen—the roof is loud tonight. Even the clay seems to remember harder.';
    if (memory.lastConversationPhase && memory.eventCount > 1) return `Last time we spoke in ${memory.lastConversationPhase}; ${fallback}`;
    if (state.phase === 'dawn') return 'Morning rain makes every cup feel newly named.';
    return fallback;
  }
}
