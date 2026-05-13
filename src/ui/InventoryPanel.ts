import Phaser from 'phaser';
import { InventorySystem, INVENTORY_ITEMS, ItemId } from '../systems/InventorySystem';

const ITEM_ORDER: ItemId[] = ['riverClay', 'wetCup', 'firedCup'];

export class InventoryPanel {
  private panel: Phaser.GameObjects.Rectangle;
  private title: Phaser.GameObjects.Text;
  private rows: Phaser.GameObjects.Text[] = [];
  private quest: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.panel = scene.add.rectangle(70, 48, 122, 76, 0x211922, 0.76).setScrollFactor(0).setDepth(101);
    this.panel.setStrokeStyle(1, 0xd59b6a, 0.5);
    this.title = scene.add
      .text(14, 16, 'satchel', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#f7e7c1',
      })
      .setScrollFactor(0)
      .setDepth(102);

    ITEM_ORDER.forEach((_, index) => {
      this.rows.push(
        scene.add
          .text(18, 30 + index * 11, '', {
            fontFamily: 'monospace',
            fontSize: '7px',
            color: '#d9c7aa',
          })
          .setScrollFactor(0)
          .setDepth(102),
      );
    });

    this.quest = scene.add
      .text(14, 64, '', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#f5b56b',
        wordWrap: { width: 110 },
      })
      .setScrollFactor(0)
      .setDepth(102);
  }

  update(inventory: InventorySystem, questLine: string) {
    this.title.setText(`satchel · ${inventory.state.coins} coins`);
    ITEM_ORDER.forEach((itemId, index) => {
      const item = INVENTORY_ITEMS[itemId];
      const count = inventory.count(itemId);
      this.rows[index].setText(`${count > 0 ? '•' : '·'} ${item.name.padEnd(10, ' ')} x${count}`);
      this.rows[index].setColor(count > 0 ? '#f7e7c1' : '#8b7b71');
    });
    this.quest.setText(questLine);
  }
}
