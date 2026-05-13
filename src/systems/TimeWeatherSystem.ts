import Phaser from 'phaser';

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface VillageAtmosphereState {
  minuteOfDay: number;
  phase: DayPhase;
  lightAlpha: number;
  lanternAlpha: number;
  rainIntensity: number;
  fogAlpha: number;
  soundCue: string;
}

export class TimeWeatherSystem {
  private readonly dayLengthMs = 96_000;
  private readonly startMinute = 16 * 60 + 40;

  constructor(private readonly scene: Phaser.Scene) {}

  state(): VillageAtmosphereState {
    const minuteOfDay = Math.floor((this.startMinute + (this.scene.time.now / this.dayLengthMs) * 1440) % 1440);
    const phase = this.phaseFor(minuteOfDay);
    const cycle = (Math.sin(this.scene.time.now / 8400) + 1) / 2;
    const rainIntensity = Phaser.Math.Clamp(0.42 + cycle * 0.44 + (phase === 'night' ? 0.1 : 0), 0.25, 1);

    return {
      minuteOfDay,
      phase,
      lightAlpha: this.lightAlphaFor(phase, minuteOfDay),
      lanternAlpha: phase === 'night' ? 0.34 : phase === 'dusk' || phase === 'dawn' ? 0.22 : 0.1,
      rainIntensity,
      fogAlpha: Phaser.Math.Clamp(0.12 + rainIntensity * 0.18 + (phase === 'night' ? 0.08 : 0), 0.16, 0.42),
      soundCue: this.soundCueFor(phase, rainIntensity),
    };
  }

  clockLabel(state = this.state()): string {
    const hour = Math.floor(state.minuteOfDay / 60);
    const minute = state.minuteOfDay % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${state.phase}`;
  }

  private phaseFor(minute: number): DayPhase {
    if (minute < 360 || minute >= 1260) return 'night';
    if (minute < 540) return 'dawn';
    if (minute < 1080) return 'day';
    return 'dusk';
  }

  private lightAlphaFor(phase: DayPhase, minute: number): number {
    if (phase === 'night') return 0.52;
    if (phase === 'day') return 0.16;
    if (phase === 'dawn') return Phaser.Math.Linear(0.48, 0.18, (minute - 360) / 180);
    return Phaser.Math.Linear(0.18, 0.5, (minute - 1080) / 180);
  }

  private soundCueFor(phase: DayPhase, rainIntensity: number): string {
    const rain = rainIntensity > 0.78 ? 'heavy roof rain' : rainIntensity > 0.52 ? 'soft puddle rain' : 'mist rain';
    const time = phase === 'night' ? 'distant owls' : phase === 'dawn' ? 'sleepy sparrows' : 'kiln room hush';
    return `${rain} · ${time}`;
  }
}
