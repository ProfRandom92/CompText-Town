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
    this.drawMap(map.tiles);
    this.addAtmosphere(map.width * TILE_SIZE, map.height * TILE_SIZE);

    this.player = this.physics.add.sprite(100, 112, 'player').setDepth(30).setSize(8, 10).setOffset(2, 6);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setBounds(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.createWorldObjects(map.markers);
    this.dialogue = new DialogueBox(this);
    this.debugOverlay = new CompTextDebugOverlay(this, this.timeline);
    this.createControls();
    this.createHud();
  }

  update() {
    this.movePlayer();
    this.updateInteractionPrompt();
    this.dialogue.update();
    this.rain.update();
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) this.debugOverlay.toggle();
  }

  private drawMap(tiles: ReturnType<typeof createVillageMap>['tiles']) {
    const collisionLayer = this.physics.add.staticGroup();
    tiles.forEach((row, y) => {
      row.forEach((tileKey, x) => {
        const tile = TILES[tileKey];
        const rect = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE,
          tile.tint,
        );
        rect.setDepth(0);
        if ((x + y) % 5 === 0) rect.setAlpha(0.92);
        if (tile.collides) {
          const blocker = this.add.zone(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
          collisionLayer.add(blocker);
        }
      });
    });
    this.time.delayedCall(0, () => this.physics.add.collider(this.player, collisionLayer));
    this.drawWorkshopDetails();
  }

  private drawWorkshopDetails() {
    this.add.rectangle(75, 68, 82, 50, 0x7d3840).setDepth(4);
    this.add.rectangle(75, 82, 76, 48, 0xa97857).setDepth(5);
    this.add.rectangle(75, 105, 18, 10, 0x211922).setDepth(7);
    this.add.text(38, 42, 'Mosscup Pottery', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
    this.add.rectangle(300, 66, 28, 28, 0x57352f).setDepth(6);
    this.add.circle(300, 66, 10, 0xff7f4f, 0.42).setDepth(7);
    this.add.rectangle(190, 162, 20, 14, 0x8b5d43).setDepth(6);
    this.add.text(178, 149, 'clay', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
    this.add.rectangle(335, 188, 24, 15, 0x4c3a30).setDepth(6);
    this.add.text(319, 174, 'stall', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
  }

  private addAtmosphere(width: number, height: number) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a2030, 0.24).setDepth(70);
    this.add.circle(298, 66, 34, 0xff7f4f, 0.12).setDepth(71);
    this.add.circle(75, 92, 42, 0xf5b56b, 0.1).setDepth(71);
    this.rain = new RainSystem(this);
    this.rain.create(width, height);
  }

  private createWorldObjects(markers: ReturnType<typeof createVillageMap>['markers']) {
    markers.forEach((marker) => {
      const x = marker.x * TILE_SIZE + TILE_SIZE / 2;
      const y = marker.y * TILE_SIZE + TILE_SIZE / 2;
      if (marker.kind === 'clay') {
        this.add.sprite(x, y, 'clay-node').setDepth(12);
        this.interactions.register({ id: marker.id, label: 'Gather river clay', x, y, radius: 22, onInteract: () => this.collectClay() });
      }
      if (marker.kind === 'npc') {
        this.mira = new Npc(this, x, y, 'Mira', this.timeline);
        this.interactions.register({ id: marker.id, label: 'Talk to Mira', x, y, radius: 24, onInteract: () => this.talkToMira() });
      }
      if (marker.kind === 'kiln') {
        this.interactions.register({ id: marker.id, label: 'Fire kiln', x, y, radius: 26, onInteract: () => this.fireKiln() });
      }
    });

    this.interactions.register({ id: 'wheel', label: 'Craft pottery', x: 75, y: 92, radius: 32, onInteract: () => this.craftPottery() });
    this.interactions.register({ id: 'stall', label: 'Sell pottery', x: 335, y: 188, radius: 28, onInteract: () => this.sellPottery() });
  }

  private createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.actionKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
  }

  private createHud() {
    this.hud = this.add.text(10, 8, '', { fontFamily: 'monospace', fontSize: '8px', color: '#f7e7c1' }).setScrollFactor(0).setDepth(110);
    this.prompt = this.add.text(192, 132, '', { fontFamily: 'monospace', fontSize: '8px', color: '#f5b56b' }).setOrigin(0.5).setScrollFactor(0).setDepth(110);
    this.refreshHud();
    this.dialogue.showHint('Arrow/WASD to walk. E to interact. Tab opens the hidden CompText pane.', 4200);
  }

  private movePlayer() {
    const speed = 72;
    const left = this.cursors.left?.isDown || this.wasd.A.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D.isDown;
    const up = this.cursors.up?.isDown || this.wasd.W.isDown;
    const down = this.cursors.down?.isDown || this.wasd.S.isDown;
    const velocity = new Phaser.Math.Vector2(Number(right) - Number(left), Number(down) - Number(up)).normalize().scale(speed);
    this.player.setVelocity(velocity.x || 0, velocity.y || 0);
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
    this.dialogue.showHint('You gather a lump of cool river clay.');
    this.refreshHud();
  }

  private craftPottery() {
    const crafted = this.inventory.craftPottery();
    this.timeline.add('Wheel', crafted ? 'Player shaped a small cup on the pottery wheel.' : 'Player tried to craft without enough clay.', 'craft:pottery|wheel|clay');
    this.dialogue.showHint(crafted ? 'The wheel hums. A small unfired cup takes shape.' : 'You need 2 clay to shape a cup.');
    this.refreshHud();
  }

  private fireKiln() {
    const fired = this.inventory.fireKiln();
    this.timeline.add('Kiln', fired ? 'Player fired a cup in the glowing kiln.' : 'Player checked the kiln with no unfired pottery ready.', 'kiln:ember|ceramic|glow');
    this.dialogue.showHint(fired ? 'The kiln blooms orange. Your cup becomes ceramic.' : 'Bring an unfired cup to the kiln.');
    this.refreshHud();
  }

  private sellPottery() {
    const sold = this.inventory.sellPottery();
    this.timeline.add('Market stall', sold ? 'Player sold a fired cup to a raincoat traveler.' : 'Player opened the stall with no fired pottery.', 'market:coins|cup|traveler');
    this.dialogue.showHint(sold ? 'A traveler buys the cup for 18 coins.' : 'You need fired pottery to sell.');
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
