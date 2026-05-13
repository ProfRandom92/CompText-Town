export interface InventoryState {
  clay: number;
  unfiredPots: number;
  firedPots: number;
  coins: number;
}

export class InventorySystem {
  readonly state: InventoryState = {
    clay: 0,
    unfiredPots: 0,
    firedPots: 0,
    coins: 12,
  };

  collectClay(amount = 1) {
    this.state.clay += amount;
  }

  craftPottery(): boolean {
    if (this.state.clay < 2) return false;
    this.state.clay -= 2;
    this.state.unfiredPots += 1;
    return true;
  }

  fireKiln(): boolean {
    if (this.state.unfiredPots < 1) return false;
    this.state.unfiredPots -= 1;
    this.state.firedPots += 1;
    return true;
  }

  sellPottery(): boolean {
    if (this.state.firedPots < 1) return false;
    this.state.firedPots -= 1;
    this.state.coins += 18;
    return true;
  }
}
