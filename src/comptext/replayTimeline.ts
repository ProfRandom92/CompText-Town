export interface ReplayEvent {
  id: number;
  at: string;
  actor: string;
  summary: string;
  compressedContext: string;
}

export interface MemorySnapshotMoment {
  id: number;
  label: string;
  warmth: number;
  drift: number;
  compressedText: string;
}

export class ReplayTimeline {
  private events: ReplayEvent[] = [];
  private moments: MemorySnapshotMoment[] = [];
  private nextId = 1;

  add(actor: string, summary: string, compressedContext: string): ReplayEvent {
    const event = {
      id: this.nextId++,
      at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor,
      summary,
      compressedContext,
    };
    this.events.unshift(event);
    this.events = this.events.slice(0, 6);
    return event;
  }

  addMoment(label: string, warmth: number, drift: number, compressedText: string) {
    this.moments.unshift({ id: this.nextId++, label, warmth, drift, compressedText });
    this.moments = this.moments.slice(0, 4);
  }

  list(): ReplayEvent[] {
    return [...this.events];
  }

  snapshots(): MemorySnapshotMoment[] {
    return [...this.moments];
  }
}
