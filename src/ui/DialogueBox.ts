import Phaser from 'phaser';
import { DialogueLine } from '../npc/Npc';

export class DialogueBox {
  private box: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private visibleUntil = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.box = scene.add.rectangle(192, 178, 350, 58, 0x211922, 0.9).setScrollFactor(0).setDepth(100);
    this.box.setStrokeStyle(1, 0xf5b56b, 0.8);
    this.text = scene.add
      .text(28, 154, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#f7e7c1',
        wordWrap: { width: 328 },
        lineSpacing: 4,
      })
      .setScrollFactor(0)
      .setDepth(101);
    this.hide();
  }

  show(lines: DialogueLine[], duration = 5200) {
    this.box.setVisible(true);
    this.text.setVisible(true);
    this.text.setText(lines.map((line) => `${line.speaker}: ${line.text}`).join('\n'));
    this.visibleUntil = this.scene.time.now + duration;
  }

  showHint(text: string, duration = 1400) {
    this.show([{ speaker: 'Town', text }], duration);
  }

  update() {
    if (this.visibleUntil > 0 && this.scene.time.now > this.visibleUntil) this.hide();
  }

  private hide() {
    this.box.setVisible(false);
    this.text.setVisible(false);
    this.visibleUntil = 0;
  }
}
