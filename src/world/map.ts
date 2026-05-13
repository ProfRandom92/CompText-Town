export const TILE_SIZE = 16;

export type TileKey = 'grass' | 'mud' | 'stone' | 'water' | 'floor' | 'roof' | 'kiln';

export interface TileDefinition {
  key: TileKey;
  tint: number;
  collides?: boolean;
}

export const TILES: Record<TileKey, TileDefinition> = {
  grass: { key: 'grass', tint: 0x385d4b },
  mud: { key: 'mud', tint: 0x74513f },
  stone: { key: 'stone', tint: 0x6a6472, collides: true },
  water: { key: 'water', tint: 0x344b6c, collides: true },
  floor: { key: 'floor', tint: 0xa97857 },
  roof: { key: 'roof', tint: 0x7d3840, collides: true },
  kiln: { key: 'kiln', tint: 0xc86b42, collides: true },
};

const rows = [
  'wwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wggggggggggggggggggggggggggw',
  'wggmmmmgggggggggggggggmmmggw',
  'wggmfffffgggggggggggmkkkmggw',
  'wggmfffffgggggggggggmkkkmggw',
  'wggmfffffmmmmmmmmmmmmmmmmggw',
  'wggmfffffggggggggggggmmmmggw',
  'wggmrrrrrggggggggggggggggggw',
  'wggggmmmgggggggggggggggggggw',
  'wggggggggggggggggggggggggggw',
  'wgggsssggggggggggggggsssnggw',
  'wgggsssgggggcgggggggggsssggw',
  'wggggggggggggggggggggggggggw',
  'wggggggggggggggggggggggggggw',
  'wggggggggggggggggggggggggggw',
  'wggggggggggggggggggggggggggw',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwww',
];

const legend: Record<string, TileKey> = {
  g: 'grass',
  m: 'mud',
  s: 'stone',
  w: 'water',
  f: 'floor',
  r: 'roof',
  k: 'kiln',
  c: 'mud',
  n: 'grass',
};

export interface WorldMarker {
  id: string;
  x: number;
  y: number;
  kind: 'clay' | 'npc' | 'sellbox' | 'kiln';
}

export function createVillageMap() {
  const markers: WorldMarker[] = [];
  const tiles = rows.map((row, y) =>
    [...row].map((cell, x) => {
      if (cell === 'c') markers.push({ id: 'clay-bank', x, y, kind: 'clay' });
      if (cell === 'n') markers.push({ id: 'mira', x, y, kind: 'npc' });
      if (cell === 'k' && x === 22 && y === 3) markers.push({ id: 'kiln', x, y, kind: 'kiln' });
      return legend[cell] ?? 'grass';
    }),
  );

  return {
    width: rows[0].length,
    height: rows.length,
    tiles,
    markers,
  };
}
