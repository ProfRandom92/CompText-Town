export interface ReplayEvent {
  id: number;
  at: string;
  actor: string;
  summary: string;
  compressedContext: string;
}

export class ReplayTimeline {
  private events: ReplayEvent[] = [];
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

  list(): ReplayEvent[] {
    return [...this.events];
  }
}
