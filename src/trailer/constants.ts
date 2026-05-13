export const TRAILER_FPS = 30;
export const TRAILER_WIDTH = 1920;
export const TRAILER_HEIGHT = 1080;
export const TRAILER_DURATION_FRAMES = 9 * 150;

export const sceneDurations = {
  rainyVillage: 150,
  workshopArrival: 150,
  potteryCloseup: 150,
  kilnGlow: 150,
  villagerMoment: 150,
  memoryReveal: 150,
  replayTimeline: 150,
  semanticMemory: 150,
  logoReveal: 150,
} as const;

export const palette = {
  night: '#171421',
  deepNight: '#0d0b13',
  indigo: '#242038',
  rainBlue: '#4b6a88',
  puddle: '#2b415c',
  lantern: '#ffd38a',
  ember: '#ff8f4d',
  clay: '#a7664d',
  roseClay: '#d08a68',
  moss: '#536b52',
  cream: '#f6dfb5',
  memoryCyan: '#82ffe7',
  memoryGold: '#ffe29a',
  memoryViolet: '#aa8cff',
};

export const soundtrackCues = [
  {frame: 0, cue: 'rain-bed fades in, distant thunder, bowed pad'},
  {frame: 150, cue: 'soft door chime, muffled workshop warmth'},
  {frame: 300, cue: 'ceramic wheel rhythm, close-mic clay texture'},
  {frame: 450, cue: 'kiln bass bloom, warm harmonic swell'},
  {frame: 600, cue: 'single kalimba motif for villager memory'},
  {frame: 750, cue: 'hidden choir shimmer as CompText threads appear'},
  {frame: 900, cue: 'tape-rewind granules for replay timeline'},
  {frame: 1050, cue: 'semantic pulse synced to retention glows'},
  {frame: 1200, cue: 'rain clears into logo chord and tiny kiln crackle'},
] as const;
