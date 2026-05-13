import { CompressionResult, SemanticCompressor } from '../comptext/semanticCompressor';
import { ReplayTimeline } from '../comptext/replayTimeline';

export interface NpcMemorySnapshot {
  npcName: string;
  relationship: number;
  lastRawMemory: string;
  compression: CompressionResult;
  knownActions: string[];
}

export class NpcMemory {
  private compressor = new SemanticCompressor();
  private rawMemories: string[] = [];
  private knownActions = new Set<string>();
  private lastCompression: CompressionResult = this.compressor.compress('first meeting beneath warm workshop lanterns');

  constructor(
    private readonly npcName: string,
    private relationship = 0,
    private readonly timeline: ReplayTimeline,
  ) {}

  remember(summary: string, actionTag: string): NpcMemorySnapshot {
    this.rawMemories.push(summary);
    this.knownActions.add(actionTag);
    this.relationship = Math.min(100, this.relationship + (actionTag === 'gift-clay' ? 12 : 5));
    const retainedContext = this.rawMemories.slice(-4).join(' / ');
    this.lastCompression = this.compressor.compress(retainedContext);
    this.timeline.add(this.npcName, summary, this.lastCompression.compressedText);
    return this.snapshot();
  }

  snapshot(): NpcMemorySnapshot {
    return {
      npcName: this.npcName,
      relationship: this.relationship,
      lastRawMemory: this.rawMemories.at(-1) ?? 'No shared memory yet. Rain taps softly on the kiln roof.',
      compression: this.lastCompression,
      knownActions: [...this.knownActions],
    };
  }
}
