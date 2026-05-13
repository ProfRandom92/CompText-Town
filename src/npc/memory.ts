import { CompressionResult, SemanticCompressor } from '../comptext/semanticCompressor';
import { ReplayTimeline } from '../comptext/replayTimeline';

export interface NpcMemorySnapshot {
  npcName: string;
  relationship: number;
  lastRawMemory: string;
  compression: CompressionResult;
  knownActions: string[];
  eventCount: number;
  deliveredItem?: string;
  questState: 'requesting-cup' | 'cup-delivered';
}

export class NpcMemory {
  private compressor = new SemanticCompressor();
  private rawMemories: string[] = [];
  private knownActions = new Set<string>();
  private lastCompression: CompressionResult = this.compressor.compress('first meeting beneath warm workshop lanterns');
  private deliveredItem?: string;
  private questState: NpcMemorySnapshot['questState'] = 'requesting-cup';

  constructor(
    private readonly npcName: string,
    private relationship = 0,
    private readonly timeline: ReplayTimeline,
  ) {}

  remember(summary: string, actionTag: string): NpcMemorySnapshot {
    this.rawMemories.push(summary);
    this.knownActions.add(actionTag);
    this.relationship = Math.min(100, this.relationship + this.relationshipGain(actionTag));
    const retainedContext = this.rawMemories.slice(-4).join(' / ');
    this.lastCompression = this.compressor.compress(retainedContext);
    this.timeline.add(this.npcName, summary, this.lastCompression.compressedText);
    this.timeline.addMoment(
      `${this.npcName} ${this.rawMemories.length}`,
      this.relationship,
      this.lastCompression.driftScore,
      this.lastCompression.compressedText,
    );
    return this.snapshot();
  }

  rememberDelivery(itemName: string, phase = 'rain'): NpcMemorySnapshot {
    this.deliveredItem = itemName;
    this.questState = 'cup-delivered';
    return this.remember(`Player delivered a ${itemName} to Mira during ${phase}, still warm from the kiln.`, 'delivered-fired-cup');
  }

  snapshot(): NpcMemorySnapshot {
    return {
      npcName: this.npcName,
      relationship: this.relationship,
      lastRawMemory: this.rawMemories.at(-1) ?? 'No shared memory yet. Rain taps softly on the kiln roof.',
      compression: this.lastCompression,
      knownActions: [...this.knownActions],
      eventCount: this.rawMemories.length,
      deliveredItem: this.deliveredItem,
      questState: this.questState,
    };
  }

  private relationshipGain(actionTag: string): number {
    if (actionTag === 'delivered-fired-cup') return 28;
    if (actionTag.startsWith('gift-clay')) return 12;
    return 5;
  }
}
