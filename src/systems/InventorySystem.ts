export type ItemId = 'riverClay' | 'wetCup' | 'firedCup';

export interface InventoryItemDefinition {
  id: ItemId;
  name: string;
  icon: string;
  description: string;
}

export interface InventoryState {
  clay: number;
  unfiredPots: number;
  firedPots: number;
  coins: number;
}

export interface InventorySaveState {
  counts: Record<ItemId, number>;
  coins: number;
}

export interface DroppedItem {
  id: string;
  itemId: ItemId;
  x: number;
  y: number;
}

export const INVENTORY_ITEMS: Record<ItemId, InventoryItemDefinition> = {
  riverClay: {
    id: 'riverClay',
    name: 'river clay',
    icon: 'clay-node',
    description: 'Cool, rain-dark clay gathered from the village bank.',
  },
  wetCup: {
    id: 'wetCup',
    name: 'wet cup',
    icon: 'wet-cup',
    description: 'A soft cup shaped by hand, waiting for kiln fire.',
  },
  firedCup: {
    id: 'firedCup',
    name: 'fired cup',
    icon: 'fired-cup',
    description: 'A warm little cup with kiln blush along the rim.',
  },
};

export class InventorySystem {
  private counts: Record<ItemId, number> = {
    riverClay: 0,
    wetCup: 0,
    firedCup: 0,
  };

  readonly state: InventoryState = {
    clay: 0,
    unfiredPots: 0,
    firedPots: 0,
    coins: 12,
  };

  add(itemId: ItemId, amount = 1) {
    this.counts[itemId] += amount;
    this.syncLegacyState();
  }

  remove(itemId: ItemId, amount = 1): boolean {
    if (this.counts[itemId] < amount) return false;
    this.counts[itemId] -= amount;
    this.syncLegacyState();
    return true;
  }

  count(itemId: ItemId): number {
    return this.counts[itemId];
  }

  has(itemId: ItemId, amount = 1): boolean {
    return this.count(itemId) >= amount;
  }

  exportState(): InventorySaveState {
    return {
      counts: { ...this.counts },
      coins: this.state.coins,
    };
  }

  restore(save?: InventorySaveState) {
    if (!save) return;
    this.counts = {
      riverClay: Math.max(0, save.counts.riverClay ?? 0),
      wetCup: Math.max(0, save.counts.wetCup ?? 0),
      firedCup: Math.max(0, save.counts.firedCup ?? 0),
    };
    this.state.coins = Math.max(0, save.coins ?? this.state.coins);
    this.syncLegacyState();
  }

  entries(): Array<{ definition: InventoryItemDefinition; count: number }> {
    return (Object.keys(INVENTORY_ITEMS) as ItemId[]).map((itemId) => ({
      definition: INVENTORY_ITEMS[itemId],
      count: this.counts[itemId],
    }));
  }

  collectClay(amount = 1) {
    this.add('riverClay', amount);
  }

  craftPottery(): boolean {
    if (!this.remove('riverClay', 2)) return false;
    this.add('wetCup');
    return true;
  }

  fireKiln(): boolean {
    if (!this.remove('wetCup')) return false;
    this.add('firedCup');
    return true;
  }

  sellPottery(): boolean {
    if (!this.remove('firedCup')) return false;
    this.state.coins += 18;
    return true;
  }

  deliverPottery(): boolean {
    return this.remove('firedCup');
  }

  firstDroppableItem(): ItemId | undefined {
    return (['firedCup', 'wetCup', 'riverClay'] as ItemId[]).find((itemId) => this.has(itemId));
  }

  private syncLegacyState() {
    this.state.clay = this.counts.riverClay;
    this.state.unfiredPots = this.counts.wetCup;
    this.state.firedPots = this.counts.firedCup;
  }
}
