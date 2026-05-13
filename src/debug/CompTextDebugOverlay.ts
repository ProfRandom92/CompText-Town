import Phaser from 'phaser';
import { NpcMemorySnapshot } from '../npc/memory';
import { ReplayTimeline } from '../comptext/replayTimeline';

export class CompTextDebugOverlay {
  private panel: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private enabled = false;
  private memory?: NpcMemorySnapshot;

  constructor(private readonly scene: Phaser.Scene, private readonly timeline: ReplayTimeline) {
    this.panel = scene.add.rectangle(278, 85, 196, 154, 0x10141d, 0.82).setScrollFactor(0).setDepth(120);
    this.panel.setStrokeStyle(1, 0x6ee7b7, 0.65);
    this.text = scene.add
      .text(186, 13, '', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#bfffe5',
        wordWrap: { width: 178 },
        lineSpacing: 2,
      })
      .setScrollFactor(0)
      .setDepth(121);
    this.setEnabled(false);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.panel.setVisible(enabled);
    this.text.setVisible(enabled);
    this.render();
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  updateMemory(memory: NpcMemorySnapshot) {
    this.memory = memory;
    this.render();
  }

  render() {
    if (!this.enabled) return;
    const compression = this.memory?.compression;
    const replayEvents = this.timeline.list();
    const moments = this.timeline.snapshots();
    const events = replayEvents.map((event) => `#${event.id} ${event.actor}: ${event.summary.slice(0, 28)}…`).join('\n');
    const snapshots = moments.map((moment) => `◌ ${moment.label} w${moment.warmth}/d${moment.drift} ${moment.compressedText.slice(0, 26)}…`).join('\n');
    const compressedMemory = compression?.compressedText ?? 'memory:quiet-rain';
    const warmth = this.memory?.relationship ?? 0;
    const drift = compression?.driftScore ?? 0;
    this.text.setText([
      'hidden CompTextv7 memory underlay',
      `NPC: ${this.memory?.npcName ?? 'listening...'}`,
      `warmth: ${this.bar(warmth)} ${warmth}% ${this.memory?.warmthLabel ?? ''}`,
      `semantic drift: ${this.bar(100 - drift)} ${drift}%`,
      `timeline events: ${this.memory?.eventCount ?? 0}`,
      `dialogue size: ${compression ? `${compression.rawTokens}→${compression.compressedTokens} tok` : '—'}`,
      `compressed snapshot: ${compressedMemory.length} chars`,
      `retention/reduction: ${compression?.retentionScore ?? 0}%/${compression?.tokenReduction ?? 0}%`,
      `quest: ${this.memory?.questState ?? 'requesting-cup'}`,
      `delivered: ${this.memory?.deliveredItem ?? '—'}`,
      `clusters: ${this.memory?.memoryClusters.join(', ') || '—'}`,
      `graph: ${this.memory?.relationshipGraph.join(' / ') || '—'}`,
      `archive: ${this.memory?.compressedArchive.slice(0, 52) ?? compressedMemory}`,
      `echo: ${this.memory?.replayEcho ?? '—'}`,
      `memory: ${compressedMemory}`,
      'replayable moments:',
      snapshots || '◌ no memory moments yet',
      'recent timeline:',
      events || 'no events yet',
    ].join('\n'));
  }

  private bar(value: number): string {
    const filled = Math.round(Phaser.Math.Clamp(value, 0, 100) / 20);
    return `${'♥'.repeat(filled)}${'·'.repeat(5 - filled)}`;
  }
}
