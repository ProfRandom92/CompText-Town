export class AmbientSoundHooks {
  private currentCue = '';

  update(cue: string) {
    this.currentCue = cue;
  }

  label(): string {
    return `ambience: ${this.currentCue || 'rain listening'}`;
  }
}
