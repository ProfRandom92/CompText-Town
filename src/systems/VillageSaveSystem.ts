import { InventorySaveState } from './InventorySystem';
import { NpcMemorySaveState } from '../npc/memory';

export interface VillageSaveState {
  version: 1;
  savedAt: string;
  inventory: InventorySaveState;
  relationships: Record<string, NpcMemorySaveState>;
  displayedCeramics: string[];
  journalEchoes: string[];
}

const SAVE_KEY = 'comptext-town:village-memory:v1';

export class VillageSaveSystem {
  load(): VillageSaveState | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as VillageSaveState;
      if (parsed.version !== 1) return undefined;
      return parsed;
    } catch {
      return undefined;
    }
  }

  save(state: Omit<VillageSaveState, 'version' | 'savedAt'>): VillageSaveState | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    const payload: VillageSaveState = {
      version: 1,
      savedAt: new Date().toISOString(),
      ...state,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return payload;
  }
}
