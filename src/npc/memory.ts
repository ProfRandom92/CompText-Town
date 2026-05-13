import { CompressionResult, SemanticCompressor } from '../comptext/semanticCompressor';
import { ReplayTimeline } from '../comptext/replayTimeline';

export type VillagerQuestState = 'requesting-cup' | 'cup-delivered' | 'requesting-gift' | 'gift-delivered';

export interface NpcMemorySaveState {
  relationship: number;
  rawMemories: string[];
  knownActions: string[];
  deliveredItem?: string;
  questState: VillagerQuestState;
  lastConversationPhase?: string;
}

export interface NpcMemorySnapshot {
  npcName: string;
  relationship: number;
  warmthLabel: string;
  lastRawMemory: string;
  compression: CompressionResult;
  knownActions: string[];
  eventCount: number;
  deliveredItem?: string;
  questState: VillagerQuestState;
  memoryClusters: string[];
  relationshipGraph: string[];
  compressedArchive: string;
  emotionalWarmthScore: number;
  replayEcho: string;
  lastConversationPhase?: string;
}

export class NpcMemory {
  private compressor = new SemanticCompressor();
  private rawMemories: string[] = [];
  private knownActions = new Set<string>();
  private lastCompression: CompressionResult = this.compressor.compress('first meeting beneath warm workshop lanterns');
  private deliveredItem?: string;
  private questState: VillagerQuestState = 'requesting-cup';
  private lastConversationPhase?: string;

  constructor(
    private readonly npcName: string,
    private relationship = 0,
    private readonly timeline: ReplayTimeline,
    save?: NpcMemorySaveState,
  ) {
    if (save) this.restore(save);
  }

  remember(summary: string, actionTag: string, phase?: string): NpcMemorySnapshot {
    this.rawMemories.push(summary);
    this.knownActions.add(actionTag);
    if (phase) this.lastConversationPhase = phase;
    this.relationship = Math.min(100, this.relationship + this.relationshipGain(actionTag));
    const retainedContext = this.rawMemories.slice(-4).join(' / ');
    this.lastCompression = this.compressor.compress(retainedContext || 'quiet rain at the village edge');
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
    this.questState = this.questState === 'requesting-gift' ? 'gift-delivered' : 'cup-delivered';
    return this.remember(`Player delivered a ${itemName} to ${this.npcName} during ${phase}, still warm from the kiln.`, `delivered-${itemName}`, phase);
  }

  exportState(): NpcMemorySaveState {
    return {
      relationship: this.relationship,
      rawMemories: [...this.rawMemories],
      knownActions: [...this.knownActions],
      deliveredItem: this.deliveredItem,
      questState: this.questState,
      lastConversationPhase: this.lastConversationPhase,
    };
  }

  restore(save: NpcMemorySaveState) {
    this.relationship = Math.max(0, Math.min(100, save.relationship ?? this.relationship));
    this.rawMemories = [...(save.rawMemories ?? [])].slice(-24);
    this.knownActions = new Set(save.knownActions ?? []);
    this.deliveredItem = save.deliveredItem;
    this.questState = save.questState ?? this.questState;
    this.lastConversationPhase = save.lastConversationPhase;
    this.lastCompression = this.compressor.compress(this.rawMemories.slice(-4).join(' / ') || 'restored village memory beneath rain');
  }

  setQuestState(questState: VillagerQuestState) {
    this.questState = questState;
  }

  snapshot(): NpcMemorySnapshot {
    const compressedArchive = this.compressor.compress(this.rawMemories.slice(-8).join(' / ') || 'no archive yet; rain keeps the page warm').compressedText;
    const clusters = this.clusterMemories();
    return {
      npcName: this.npcName,
      relationship: this.relationship,
      warmthLabel: this.warmthLabel(),
      lastRawMemory: this.rawMemories.at(-1) ?? 'No shared memory yet. Rain taps softly on the kiln roof.',
      compression: this.lastCompression,
      knownActions: [...this.knownActions],
      eventCount: this.rawMemories.length,
      deliveredItem: this.deliveredItem,
      questState: this.questState,
      memoryClusters: clusters,
      relationshipGraph: [`player↔${this.npcName}: ${this.warmthLabel()}`, ...clusters.map((cluster) => `${this.npcName}↔${cluster}`)],
      compressedArchive,
      emotionalWarmthScore: this.relationship,
      replayEcho: this.replayEcho(),
      lastConversationPhase: this.lastConversationPhase,
    };
  }

  private clusterMemories(): string[] {
    const joined = this.rawMemories.join(' ').toLowerCase();
    return [
      joined.includes('rain') || joined.includes('mist') ? 'weather moments' : undefined,
      joined.includes('delivered') || joined.includes('gift') ? 'gifted objects' : undefined,
      joined.includes('asked') || joined.includes('conversation') ? 'spoken promises' : undefined,
      joined.includes('kiln') || joined.includes('cup') ? 'kiln warmth' : undefined,
    ].filter((cluster): cluster is string => Boolean(cluster));
  }

  private replayEcho(): string {
    if (this.deliveredItem) return `${this.npcName} remembers the ${this.deliveredItem} whenever rain touches the eaves.`;
    if (this.rawMemories.length > 1) return `${this.npcName} recalls your earlier visit in ${this.lastConversationPhase ?? 'the rain'}.`;
    return `${this.npcName}'s first impression is still soft and unglazed.`;
  }

  private warmthLabel(): string {
    if (this.relationship >= 70) return 'trusted';
    if (this.relationship >= 40) return 'fond';
    if (this.relationship >= 18) return 'warming';
    return 'shy';
  }

  private relationshipGain(actionTag: string): number {
    if (actionTag.startsWith('delivered')) return 28;
    if (actionTag.startsWith('gift-clay')) return 12;
    if (actionTag.startsWith('remember-weather')) return 8;
    return 5;
  }
}
