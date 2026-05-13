import Phaser from 'phaser';
import { CompTextDebugOverlay } from '../debug/CompTextDebugOverlay';
import { ReplayTimeline } from '../comptext/replayTimeline';
import { Npc } from '../npc/Npc';
import { InteractionSystem } from '../systems/InteractionSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { RainSystem } from '../systems/RainSystem';
import { DialogueBox } from '../ui/DialogueBox';
import { createVillageMap, TILE_SIZE, TILES } from '../world/map';

export class VillageScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private actionKey!: Phaser.Input.Keyboard.Key;
  private debugKey!: Phaser.Input.Keyboard.Key;
  private player!: Phaser.Physics.Arcade.Sprite;
  private prompt!: Phaser.GameObjects.Text;
  private hud!: Phaser.GameObjects.Text;
  private dialogue!: DialogueBox;
  private debugOverlay!: CompTextDebugOverlay;
  private rain!: RainSystem;
  private kilnGlow!: Phaser.GameObjects.Arc;
  private lanternGlows: Phaser.GameObjects.Arc[] = [];
  private readonly inventory = new InventorySystem();
  private readonly interactions = new InteractionSystem();
  private readonly timeline = new ReplayTimeline();
  private mira!: Npc;

  constructor() {
    super('VillageScene');
  }

  create() {
    const map = createVillageMap();
    this.physics.world.setBounds(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
    const collisionLayer = this.drawMap(map.tiles);
    this.drawWorkshopDetails();
    this.drawVillageProps();
    this.addAtmosphere(map.width * TILE_SIZE, map.height * TILE_SIZE);

    this.player = this.physics.add.sprite(108, 122, 'player').setDepth(32).setSize(8, 10).setOffset(2, 6);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, collisionLayer);
    this.cameras.main.setBounds(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.createWorldObjects(map.markers);
    this.dialogue = new DialogueBox(this);
    this.debugOverlay = new CompTextDebugOverlay(this, this.timeline);
    this.debugOverlay.updateMemory(this.mira.memory.snapshot());
    this.createControls();
    this.createHud();
    this.dialogue.showHint('Rain softens Mosscup Pottery. Move with arrows/WASD, press E near warm things.', 3600);
  }

  update() {
    this.movePlayer();
    this.updateInteractionPrompt();
    this.dialogue.update();
    this.rain.update();
    this.pulseLights();
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) this.debugOverlay.toggle();
  }

  private drawMap(tiles: ReturnType<typeof createVillageMap>['tiles']) {
    const collisionLayer = this.physics.add.staticGroup();
    tiles.forEach((row, y) => {
      row.forEach((tileKey, x) => {
        const tile = TILES[tileKey];
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;
        const rect = this.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, tile.tint);
        rect.setDepth(0);
        if ((x + y) % 5 === 0) rect.setAlpha(0.9);
        if (tileKey === 'mud' && (x * 3 + y) % 7 === 0) {
          this.add.rectangle(px + 3, py + 2, 7, 2, 0x4e4250, 0.42).setDepth(1);
        }
        if (tileKey === 'grass' && (x + y * 2) % 9 === 0) {
          this.add.rectangle(px - 4, py + 4, 2, 3, 0x6f8e77, 0.36).setDepth(1);
        }
        if (tile.collides) {
          const blocker = this.add.zone(px, py, TILE_SIZE, TILE_SIZE);
          collisionLayer.add(blocker);
        }
      });
    });
    return collisionLayer;
  }

  private drawWorkshopDetails() {
    // Exterior shell and warm interior floor.
    this.add.rectangle(79, 68, 92, 50, 0x6f303d).setDepth(4);
    this.add.rectangle(79, 86, 84, 54, 0xa97857).setDepth(5);
    this.add.rectangle(79, 113, 18, 10, 0x211922).setDepth(8);
    this.add.rectangle(79, 106, 20, 6, 0xd59b6a).setDepth(7);
    this.add.rectangle(46, 78, 14, 14, 0x2a2534).setDepth(8);
    this.add.rectangle(46, 78, 8, 8, 0xf5b56b, 0.72).setDepth(9);
    this.add.rectangle(111, 78, 14, 14, 0x2a2534).setDepth(8);
    this.add.rectangle(111, 78, 8, 8, 0xf5b56b, 0.72).setDepth(9);
    this.add.text(36, 41, 'Mosscup Pottery', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(10);

    // Interior craft stations.
    this.add.sprite(61, 94, 'pottery-wheel').setDepth(12);
    this.add.sprite(96, 94, 'shelf-pots').setDepth(12);
    this.add.sprite(76, 86, 'rolled-rug').setDepth(11);

    // Exterior kiln shed.
    this.add.rectangle(358, 67, 42, 34, 0x4a3338).setDepth(6);
    this.add.rectangle(358, 50, 48, 12, 0x6f303d).setDepth(7);
    this.add.sprite(358, 70, 'kiln').setDepth(12);
    this.kilnGlow = this.add.circle(358, 70, 28, 0xff7f4f, 0.18).setDepth(72);

    // Resource and market touches.
    this.add.rectangle(197, 178, 28, 12, 0x8b5d43).setDepth(6);
    this.add.sprite(197, 168, 'clay-node').setDepth(12);
    this.add.text(183, 154, 'river clay', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
    this.add.rectangle(404, 218, 32, 18, 0x4c3a30).setDepth(6);
    this.add.sprite(396, 210, 'pot').setDepth(12);
    this.add.text(382, 196, 'rain stall', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
  }

  private drawVillageProps() {
    const lanterns = [
      { x: 145, y: 126 },
      { x: 265, y: 94 },
      { x: 404, y: 198 },
    ];
    lanterns.forEach(({ x, y }) => {
      this.add.sprite(x, y, 'lantern-post').setDepth(15);
      this.lanternGlows.push(this.add.circle(x, y - 8, 25, 0xf5b56b, 0.12).setDepth(72));
    });

    [
      { x: 132, y: 158 },
      { x: 222, y: 126 },
      { x: 284, y: 190 },
      { x: 52, y: 138 },
    ].forEach(({ x, y }) => this.add.sprite(x, y, 'puddle').setDepth(3));
  }

  private addAtmosphere(width: number, height: number) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a2030, 0.28).setDepth(70);
    this.add.rectangle(width / 2, height / 2, width, height, 0x10141d, 0.12).setDepth(73);
    this.rain = new RainSystem(this);
    this.rain.create(width, height);
  }

  private createWorldObjects(markers: ReturnType<typeof createVillageMap>['markers']) {
    markers.forEach((marker) => {
      const x = marker.x * TILE_SIZE + TILE_SIZE / 2;
      const y = marker.y * TILE_SIZE + TILE_SIZE / 2;
      if (marker.kind === 'clay') {
        this.add.sprite(x, y, 'clay-node').setDepth(12);
        this.interactions.register({ id: marker.id, label: 'Gather river clay', x, y, radius: 24, onInteract: () => this.collectClay() });
      }
      if (marker.kind === 'npc') {
        this.mira = new Npc(this, x, y, 'Mira', this.timeline);
        this.interactions.register({ id: marker.id, label: 'Talk to Mira', x, y, radius: 26, onInteract: () => this.talkToMira() });
      }
      if (marker.kind === 'kiln') {
        this.interactions.register({ id: marker.id, label: 'Fire kiln', x, y, radius: 30, onInteract: () => this.fireKiln() });
      }
    });

    this.interactions.register({ id: 'wheel', label: 'Shape a cup', x: 61, y: 94, radius: 28, onInteract: () => this.craftPottery() });
    this.interactions.register({ id: 'stall', label: 'Sell pottery', x: 396, y: 210, radius: 30, onInteract: () => this.sellPottery() });
  }

  private createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.actionKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
  }

  private createHud() {
    this.hud = this.add
      .text(10, 8, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#f7e7c1',
        backgroundColor: '#211922aa',
        padding: { x: 6, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.prompt = this.add
      .text(192, 136, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#f5b56b',
        backgroundColor: '#211922cc',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(374, 8, 'TAB: comptext', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#8aa0ba',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
    this.refreshHud();
  }

  private movePlayer() {
    const speed = 74;
    const velocity = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.wasd.A.isDown) velocity.x -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) velocity.x += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) velocity.y -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) velocity.y += 1;
    velocity.normalize().scale(speed);
    this.player.setVelocity(velocity.x, velocity.y);
    if (velocity.lengthSq() > 0) {
      this.player.setFlipX(velocity.x < 0);
      this.player.setDepth(this.player.y + 20);
    }
  }

  private pulseLights() {
    const pulse = 0.04 * Math.sin(this.time.now / 220);
    this.kilnGlow.setAlpha(0.17 + pulse);
    this.lanternGlows.forEach((glow, index) => glow.setAlpha(0.11 + 0.025 * Math.sin(this.time.now / 260 + index)));
  }

  private updateInteractionPrompt() {
    const target = this.interactions.nearest(new Phaser.Math.Vector2(this.player.x, this.player.y));
    this.prompt.setText(target ? `E — ${target.label}` : '');
  }

  private interact() {
    this.interactions.nearest(new Phaser.Math.Vector2(this.player.x, this.player.y))?.onInteract();
  }

  private collectClay() {
    this.inventory.collectClay();
    this.timeline.add('Workshop', 'Player gathered cool river clay near the lantern path.', 'resource:clay|rain|hands');
    this.dialogue.showHint('You kneel by the bank. Cold clay darkens your sleeves.');
    this.refreshHud();
  }

  private craftPottery() {
    const crafted = this.inventory.craftPottery();
    this.timeline.add('Wheel', crafted ? 'Player shaped a small cup on the pottery wheel.' : 'Player tried to craft without enough clay.', 'craft:pottery|wheel|clay');
    this.dialogue.showHint(crafted ? 'The wheel hums like rain in a teacup. A small cup takes shape.' : 'The wheel waits. You need 2 clay to shape a cup.');
    this.refreshHud();
  }

  private fireKiln() {
    const fired = this.inventory.fireKiln();
    this.timeline.add('Kiln', fired ? 'Player fired a cup in the glowing kiln.' : 'Player checked the kiln with no unfired pottery ready.', 'kiln:ember|ceramic|glow');
    this.dialogue.showHint(fired ? 'The kiln blooms orange, bright enough to make the puddles blush.' : 'Bring an unfired cup to the kiln.');
    this.refreshHud();
  }

  private sellPottery() {
    const sold = this.inventory.sellPottery();
    this.timeline.add('Market stall', sold ? 'Player sold a fired cup to a raincoat traveler.' : 'Player opened the stall with no fired pottery.', 'market:coins|cup|traveler');
    this.dialogue.showHint(sold ? 'A traveler buys the cup for 18 coins and calls it a small sunrise.' : 'The stall smells of cedar and rain. You need fired pottery to sell.');
    this.refreshHud();
  }

  private talkToMira() {
    const result = this.mira.talk(this.inventory.state.clay > 0);
    this.dialogue.show(result.lines);
    this.debugOverlay.updateMemory(result.memory);
  }

  private refreshHud() {
    const { clay, unfiredPots, firedPots, coins } = this.inventory.state;
    this.hud.setText(`clay ${clay}  wet cups ${unfiredPots}  fired ${firedPots}  coins ${coins}`);
  }
}
