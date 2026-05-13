import Phaser from 'phaser';
import { NpcMemorySnapshot } from '../npc/memory';
import { ReplayTimeline } from '../comptext/replayTimeline';

export class CompTextDebugOverlay {
  private panel: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private enabled = false;
  private memory?: NpcMemorySnapshot;

  constructor(private readonly scene: Phaser.Scene, private readonly timeline: ReplayTimeline) {
    this.panel = scene.add.rectangle(278, 80, 196, 138, 0x10141d, 0.82).setScrollFactor(0).setDepth(120);
    this.panel.setStrokeStyle(1, 0x6ee7b7, 0.65);
    this.text = scene.add
      .text(186, 16, '', {
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
    const events = replayEvents.map((event) => `#${event.id} ${event.actor}: ${event.summary.slice(0, 30)}…`).join('\n');
    const compressedMemory = compression?.compressedText ?? 'memory:quiet-rain';
    this.text.setText([
      'hidden CompTextv7 pane',
      `NPC: ${this.memory?.npcName ?? 'listening...'}`,
      `memory events: ${this.memory?.eventCount ?? 0}`,
      `dialogue size: ${compression ? `${compression.rawTokens}→${compression.compressedTokens} tok` : '—'}`,
      `compressed size: ${compressedMemory.length} chars`,
      `semantic retention: ${compression?.retentionScore ?? 0}%`,
      `semantic reduction: ${compression?.tokenReduction ?? 0}%`,
      `replay events: ${replayEvents.length}`,
      `quest: ${this.memory?.questState ?? 'requesting-cup'}`,
      `delivered: ${this.memory?.deliveredItem ?? '—'}`,
      `memory: ${compressedMemory}`,
      'replay:',
      events || 'no events yet',
    ].join('\n'));
  }
}
