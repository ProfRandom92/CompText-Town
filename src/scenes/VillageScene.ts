import Phaser from 'phaser';
import { CompTextDebugOverlay } from '../debug/CompTextDebugOverlay';
import { ReplayTimeline } from '../comptext/replayTimeline';
import { Npc, VILLAGER_PROFILES } from '../npc/Npc';
import { AmbientSoundHooks } from '../systems/AmbientSoundHooks';
import { AtmosphereSystem } from '../systems/AtmosphereSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { INVENTORY_ITEMS, InventorySystem, ItemId } from '../systems/InventorySystem';
import { RainSystem } from '../systems/RainSystem';
import { TimeWeatherSystem, VillageAtmosphereState } from '../systems/TimeWeatherSystem';
import { VillageSaveState, VillageSaveSystem } from '../systems/VillageSaveSystem';
import { DialogueBox } from '../ui/DialogueBox';
import { InventoryPanel } from '../ui/InventoryPanel';
import { createVillageMap, TILE_SIZE, TILES } from '../world/map';

export class VillageScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private actionKey!: Phaser.Input.Keyboard.Key;
  private dropKey!: Phaser.Input.Keyboard.Key;
  private debugKey!: Phaser.Input.Keyboard.Key;
  private journalKey!: Phaser.Input.Keyboard.Key;
  private player!: Phaser.Physics.Arcade.Sprite;
  private prompt!: Phaser.GameObjects.Text;
  private hud!: Phaser.GameObjects.Text;
  private inventoryPanel!: InventoryPanel;
  private dialogue!: DialogueBox;
  private debugOverlay!: CompTextDebugOverlay;
  private rain!: RainSystem;
  private atmosphere!: AtmosphereSystem;
  private timeWeather!: TimeWeatherSystem;
  private soundHooks = new AmbientSoundHooks();
  private atmosphereState!: VillageAtmosphereState;
  private soundHud!: Phaser.GameObjects.Text;
  private journalText!: Phaser.GameObjects.Text;
  private kilnGlow!: Phaser.GameObjects.Arc;
  private kilnFire!: Phaser.GameObjects.Arc;
  private lanternGlows: Phaser.GameObjects.Arc[] = [];
  private readonly inventory = new InventorySystem();
  private readonly interactions = new InteractionSystem();
  private readonly timeline = new ReplayTimeline();
  private readonly saveSystem = new VillageSaveSystem();
  private readonly droppedSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private nextDroppedItemId = 1;
  private loadedSave?: VillageSaveState;
  private villagers: Npc[] = [];
  private displayedCeramics: string[] = [];
  private journalEchoes: string[] = [];
  private shelfSprites: Phaser.GameObjects.Sprite[] = [];
  private readonly shelfSpots = [
    { x: 88, y: 78 },
    { x: 100, y: 78 },
    { x: 88, y: 91 },
    { x: 100, y: 91 },
  ];
  private mira!: Npc;

  constructor() {
    super('VillageScene');
  }

  create() {
    this.loadedSave = this.saveSystem.load();
    this.inventory.restore(this.loadedSave?.inventory);
    this.displayedCeramics = [...(this.loadedSave?.displayedCeramics ?? [])];
    this.journalEchoes = [...(this.loadedSave?.journalEchoes ?? [])];
    const map = createVillageMap();
    this.physics.world.setBounds(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
    const collisionLayer = this.drawMap(map.tiles);
    this.drawWorkshopDetails();
    const puddles = this.drawVillageProps();
    this.addAtmosphere(map.width * TILE_SIZE, map.height * TILE_SIZE, puddles);

    this.player = this.physics.add.sprite(108, 122, 'player').setDepth(32).setSize(8, 10).setOffset(2, 6);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, collisionLayer);
    this.cameras.main.setBounds(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.createWorldObjects(map.markers);
    this.dialogue = new DialogueBox(this);
    this.debugOverlay = new CompTextDebugOverlay(this, this.timeline);
    this.debugOverlay.updateMemory(this.mira.memory.snapshot());
    this.updateDisplayShelves();
    this.createControls();
    this.createHud();
    this.dialogue.showHint('Rain softens Mosscup Pottery. Villagers remember gifts, weather, and the cups you choose to display.', 3600);
    this.saveWorld();
  }

  update() {
    this.movePlayer();
    this.updateInteractionPrompt();
    this.dialogue.update();
    this.updateAtmosphere();
    this.rain.update();
    this.pulseLights();
    this.updateNpcLife();
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.dropKey)) this.dropHeldItem();
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) this.debugOverlay.toggle();
    if (Phaser.Input.Keyboard.JustDown(this.journalKey)) this.toggleJournal();
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
    this.add.rectangle(94, 72, 32, 4, 0x4c2f2f).setDepth(12);
    this.add.rectangle(94, 85, 32, 4, 0x4c2f2f).setDepth(12);
    this.add.sprite(76, 86, 'rolled-rug').setDepth(11);

    // Exterior kiln shed.
    this.add.rectangle(358, 67, 42, 34, 0x4a3338).setDepth(6);
    this.add.rectangle(358, 50, 48, 12, 0x6f303d).setDepth(7);
    this.add.sprite(358, 70, 'kiln').setDepth(12);
    this.kilnGlow = this.add.circle(358, 70, 28, 0xff7f4f, 0.18).setDepth(72);
    this.kilnFire = this.add.circle(358, 73, 6, 0xffb36b, 0.6).setDepth(13);

    // Resource and market touches.
    this.add.rectangle(197, 178, 28, 12, 0x8b5d43).setDepth(6);
    this.add.sprite(197, 168, 'clay-node').setDepth(12);
    this.add.text(183, 154, 'river clay', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
    this.add.rectangle(404, 218, 32, 18, 0x4c3a30).setDepth(6);
    this.add.sprite(396, 210, 'pot').setDepth(12);
    this.add.text(382, 196, 'rain stall', { fontFamily: 'monospace', fontSize: '7px', color: '#f7e7c1' }).setDepth(8);
  }

  private drawVillageProps(): Phaser.GameObjects.Sprite[] {
    const lanterns = [
      { x: 145, y: 126 },
      { x: 265, y: 94 },
      { x: 404, y: 198 },
    ];
    lanterns.forEach(({ x, y }) => {
      this.add.sprite(x, y, 'lantern-post').setDepth(15);
      this.lanternGlows.push(this.add.circle(x, y - 8, 25, 0xf5b56b, 0.12).setDepth(72));
    });

    const puddles = [
      { x: 132, y: 158 },
      { x: 222, y: 126 },
      { x: 284, y: 190 },
      { x: 52, y: 138 },
    ].map(({ x, y }) => this.add.sprite(x, y, 'puddle').setDepth(3));
    return puddles;
  }

  private addAtmosphere(width: number, height: number, puddles: Phaser.GameObjects.Sprite[]) {
    this.timeWeather = new TimeWeatherSystem(this);
    this.atmosphere = new AtmosphereSystem(this);
    this.atmosphere.create(width, height, puddles);
    this.rain = new RainSystem(this);
    this.rain.create(width, height);
    this.atmosphereState = this.timeWeather.state();
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
        this.createVillagers(x, y);
      }
      if (marker.kind === 'kiln') {
        this.interactions.register({ id: marker.id, label: 'Fire kiln', x, y, radius: 30, onInteract: () => this.fireKiln() });
      }
    });

    this.interactions.register({ id: 'wheel', label: 'Shape a cup', x: 61, y: 94, radius: 28, onInteract: () => this.craftPottery() });
    this.interactions.register({ id: 'display-shelf', label: 'Place cup on shelf', x: 96, y: 94, radius: 26, onInteract: () => this.placeCupOnShelf() });
    this.interactions.register({ id: 'stall', label: 'Sell spare cup', x: 396, y: 210, radius: 30, onInteract: () => this.sellPottery() });
  }


  private createVillagers(markerX: number, markerY: number) {
    this.villagers = VILLAGER_PROFILES.map((profile, index) => {
      const x = index === 0 ? markerX : profile.anchors.home.x;
      const y = index === 0 ? markerY : profile.anchors.home.y;
      const villager = new Npc(this, x, y, profile, this.timeline, this.loadedSave?.relationships[profile.id]);
      this.interactions.register({
        id: profile.id,
        label: `Talk to ${profile.displayName}`,
        x,
        y,
        radius: 26,
        onInteract: () => this.talkToVillager(villager),
      });
      if (profile.id === 'mira') this.mira = villager;
      return villager;
    });
  }

  private placeCupOnShelf() {
    if (this.displayedCeramics.length >= this.shelfSpots.length) {
      this.dialogue.showHint('Every shelf is already holding a little piece of your weathered history.');
      return;
    }
    if (!this.inventory.remove('firedCup')) {
      this.dialogue.showHint('The shelf waits for a fired cup with kiln warmth still inside it.');
      return;
    }
    const label = `${this.timeWeather.clockLabel(this.atmosphereState)} cup`;
    this.displayedCeramics.push(label);
    this.timeline.add('Workshop shelf', `Player displayed a fired cup as ${label}.`, 'workshop:display|ceramic|memory');
    this.rememberJournal(`A displayed cup caught the ${this.atmosphereState.phase} rain-light on the workshop shelf.`);
    this.updateDisplayShelves();
    this.saveWorld();
    this.dialogue.showHint('You set the cup on the shelf. The workshop feels a little more yours.');
    this.refreshHud();
  }

  private updateDisplayShelves() {
    this.shelfSprites.forEach((sprite) => sprite.destroy());
    this.shelfSprites = this.displayedCeramics.slice(0, this.shelfSpots.length).map((_, index) => {
      const spot = this.shelfSpots[index];
      const sprite = this.add.sprite(spot.x, spot.y, 'fired-cup').setDepth(14);
      sprite.setTint(index % 2 === 0 ? 0xffffff : 0xf5d6a1);
      return sprite;
    });
  }

  private toggleJournal() {
    this.renderJournal();
    this.journalText.setVisible(!this.journalText.visible);
  }

  private renderJournal() {
    const relationships = this.villagers
      .map((villager) => {
        const memory = villager.memory.snapshot();
        return `${villager.displayName}: ${memory.warmthLabel} ${memory.emotionalWarmthScore}% — ${memory.replayEcho}`;
      })
      .join('\n');
    const shelves = this.displayedCeramics.length > 0 ? this.displayedCeramics.map((cup) => `• ${cup}`).join('\n') : '• empty shelves waiting for kiln-blush';
    const echoes = this.journalEchoes.slice(0, 4).map((echo) => `◌ ${echo}`).join('\n') || '◌ no echoes replayed yet';
    this.journalText.setText(['Village memory journal', relationships, 'shelves:', shelves, 'echoes:', echoes].join('\n'));
  }

  private rememberJournal(echo: string) {
    this.journalEchoes = [echo, ...this.journalEchoes.filter((entry) => entry !== echo)].slice(0, 8);
    if (this.journalText?.visible) this.renderJournal();
  }

  private saveWorld() {
    this.saveSystem.save({
      inventory: this.inventory.exportState(),
      relationships: Object.fromEntries(this.villagers.map((villager) => [villager.id, villager.memory.exportState()])),
      displayedCeramics: [...this.displayedCeramics],
      journalEchoes: [...this.journalEchoes],
    });
  }

  private createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.actionKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.dropKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.journalKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
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
    this.inventoryPanel = new InventoryPanel(this);
    this.soundHud = this.add
      .text(10, 30, '', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#8aa0ba',
        backgroundColor: '#21192266',
        padding: { x: 5, y: 3 },
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(374, 8, 'E: use  Q: drop  J: journal  TAB: comptext', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#8aa0ba',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
    this.journalText = this.add
      .text(10, 52, '', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#f7e7c1',
        backgroundColor: '#211922dd',
        padding: { x: 6, y: 5 },
        wordWrap: { width: 180 },
      })
      .setScrollFactor(0)
      .setDepth(119)
      .setVisible(false);
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
    const lanternBase = this.atmosphereState?.lanternAlpha ?? 0.12;
    this.kilnGlow.setAlpha(0.17 + pulse + (this.atmosphereState?.phase === 'night' ? 0.06 : 0));
    this.kilnFire.setScale(1 + Math.sin(this.time.now / 130) * 0.12, 1 + Math.cos(this.time.now / 180) * 0.18);
    this.kilnFire.setAlpha(0.48 + Math.sin(this.time.now / 95) * 0.16);
    this.lanternGlows.forEach((glow, index) => glow.setAlpha(lanternBase + 0.035 * Math.sin(this.time.now / 260 + index)));
  }

  private updateAtmosphere() {
    this.atmosphereState = this.timeWeather.state();
    this.rain.setIntensity(this.atmosphereState.rainIntensity);
    this.atmosphere.update(this.atmosphereState);
    this.soundHooks.update(this.atmosphereState.soundCue);
    this.soundHud.setText(`${this.timeWeather.clockLabel(this.atmosphereState)}  ${this.soundHooks.label()}`);
  }

  private updateNpcLife() {
    this.villagers.forEach((villager) => {
      villager.updateSchedule(this.atmosphereState);
      const npcPosition = villager.positionForInteraction();
      this.interactions.updatePosition(villager.id, npcPosition.x, npcPosition.y);
    });
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
    this.saveWorld();
    this.refreshHud();
  }

  private craftPottery() {
    const crafted = this.inventory.craftPottery();
    this.timeline.add('Wheel', crafted ? 'Player shaped a small cup on the pottery wheel.' : 'Player tried to craft without enough clay.', 'craft:pottery|wheel|clay');
    this.dialogue.showHint(crafted ? 'The wheel hums like rain in a teacup. A small cup takes shape.' : 'The wheel waits. You need 2 clay to shape a cup.');
    if (crafted) this.saveWorld();
    this.refreshHud();
  }

  private fireKiln() {
    const fired = this.inventory.fireKiln();
    this.timeline.add('Kiln', fired ? 'Player fired a cup in the glowing kiln.' : 'Player checked the kiln with no unfired pottery ready.', 'kiln:ember|ceramic|glow');
    this.dialogue.showHint(fired ? 'The kiln blooms orange, bright enough to make the puddles blush.' : 'Bring an unfired cup to the kiln.');
    if (fired) this.saveWorld();
    this.refreshHud();
  }

  private sellPottery() {
    const sold = this.inventory.sellPottery();
    this.timeline.add('Market stall', sold ? 'Player sold a fired cup to a raincoat traveler.' : 'Player opened the stall with no fired pottery.', 'market:coins|cup|traveler');
    this.dialogue.showHint(sold ? 'A traveler buys the cup for 18 coins and calls it a small sunrise.' : 'The stall smells of cedar and rain. You need fired pottery to sell.');
    if (sold) this.saveWorld();
    this.refreshHud();
  }

  private talkToMira() {
    this.talkToVillager(this.mira);
  }

  private talkToVillager(villager: Npc) {
    const currentMemory = villager.memory.snapshot();
    const fulfilled = currentMemory.questState === 'cup-delivered' || currentMemory.questState === 'gift-delivered';
    const canDeliver = !fulfilled && this.inventory.has(villager.profile.preference);
    const result = canDeliver
      ? this.deliverGiftToVillager(villager)
      : villager.talk(this.inventory.has(villager.profile.preference), this.atmosphereState);
    this.rememberJournal(result.memory.replayEcho);
    this.dialogue.show(result.lines);
    this.debugOverlay.updateMemory(result.memory);
    this.saveWorld();
    this.refreshHud();
  }

  private deliverGiftToVillager(villager: Npc) {
    this.inventory.remove(villager.profile.preference);
    const itemName = INVENTORY_ITEMS[villager.profile.preference].name;
    this.timeline.add('Delivery', `Player delivered ${itemName} to ${villager.displayName}.`, `quest:delivered|${villager.profile.preference}|${villager.id}`);
    return villager.receiveDelivery(itemName, this.atmosphereState);
  }

  private dropHeldItem() {
    const itemId = this.inventory.firstDroppableItem();
    if (!itemId) {
      this.dialogue.showHint('Your satchel is only holding rain-scent and lint.');
      return;
    }
    if (!this.inventory.remove(itemId)) return;
    const item = INVENTORY_ITEMS[itemId];
    const dropX = this.player.x + (this.player.flipX ? -14 : 14);
    const dropY = this.player.y + 8;
    const id = `drop-${this.nextDroppedItemId++}`;
    const sprite = this.add.sprite(dropX, dropY, item.icon).setDepth(dropY + 10);
    this.droppedSprites.set(id, sprite);
    this.interactions.register({ id, label: `Pick up ${item.name}`, x: dropX, y: dropY, radius: 18, onInteract: () => this.pickUpDroppedItem(id, itemId) });
    this.timeline.add('Satchel', `Player set down ${item.name} on the rain-dark path.`, `item:drop|${itemId}`);
    this.dialogue.showHint(`You set down ${item.name}. It rests gently in the rain.`);
    this.saveWorld();
    this.refreshHud();
  }

  private pickUpDroppedItem(id: string, itemId: ItemId) {
    const item = INVENTORY_ITEMS[itemId];
    this.inventory.add(itemId);
    this.interactions.unregister(id);
    this.droppedSprites.get(id)?.destroy();
    this.droppedSprites.delete(id);
    this.timeline.add('Satchel', `Player picked ${item.name} back up from the path.`, `item:pickup|${itemId}`);
    this.dialogue.showHint(`You tuck ${item.name} back into your satchel.`);
    this.saveWorld();
    this.refreshHud();
  }

  private refreshHud() {
    const { clay, unfiredPots, firedPots, coins } = this.inventory.state;
    this.hud.setText(`clay ${clay}  wet cups ${unfiredPots}  fired ${firedPots}  coins ${coins}`);
    this.inventoryPanel.update(this.inventory, this.questLine());
  }

  private questLine(): string {
    const openRequest = this.villagers.find((villager) => !['cup-delivered', 'gift-delivered'].includes(villager.memory.snapshot().questState));
    const memory = this.mira?.memory.snapshot();
    if (!openRequest && this.displayedCeramics.length > 0) return 'The workshop shelves remember your hands.';
    if (memory?.questState === 'cup-delivered') return 'Mira remembers your cup.';
    if (this.inventory.has('firedCup')) return 'Quest: bring cup to Mira.';
    if (this.inventory.has('wetCup')) return 'Quest: fire cup in kiln.';
    if (this.inventory.has('riverClay', 2)) return 'Quest: shape cup at wheel.';
    return 'Quest: collect 2 river clay.';
  }
}
