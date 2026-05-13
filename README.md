# CompText Town

**CompText Town** is a cozy browser-based pixel-art vertical slice where a rainy pottery village quietly doubles as an interactive showcase for conceptual **CompTextv7 semantic compression** technology.

The intended feeling is: **Studio Ghibli meets semantic AI observability**.

## Current vertical slice

- Phaser.js + TypeScript + Vite browser game setup.
- A small rainy evening village with a pottery workshop, clay bank, kiln, market stall, lantern warmth, rain, and kiln glow.
- Controllable pixel-art player using Arrow keys or WASD.
- Basic pottery loop:
  1. gather clay,
  2. craft an unfired cup at the workshop wheel,
  3. fire the cup in the kiln,
  4. sell fired pottery at the stall.
- Mira, the first villager NPC, with relationship growth and compressed conversation memory.
- Optional CompText debug overlay showing token reduction, semantic retention, drift, memory state, compressed context, and replay events.
- Export-ready Remotion trailer composition for a cinematic rainy pottery-village reveal.
- Placeholder pixel textures generated at boot for a cloud-friendly first version without a heavy asset pipeline.

## Controls

| Input | Action |
| --- | --- |
| Arrow keys / WASD | Walk around town |
| E | Interact with nearby NPCs and workshop objects |
| Tab | Toggle the hidden CompTextv7 debug pane |

## Project structure

```text
src/
  assets/     Pixel palette and placeholder asset helpers
  comptext/   Semantic compression, retention, drift, replay timeline
  debug/      Optional CompText observability overlays
  npc/        NPC actors, dialogue, relationship memory
  scenes/     Phaser scenes
  systems/    Inventory, interaction, rain and game systems
  trailer/    Remotion trailer compositions, reusable cinematic components, and scene system
  ui/         Pixel-friendly dialogue and HUD UI
  world/      Village tilemap and world markers
```

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Remotion trailer

The cinematic trailer lives in `src/trailer` and is structured as modular React + TypeScript scenes. It aims for **cozy atmospheric pixel-art** rather than a corporate product walkthrough: warm lanterns, rainy cobblestones, glowing pottery, fog, replay echoes, and subtle semantic memory magic.

```bash
# Open the Remotion Studio timeline
npm run trailer:studio

# Validate available Remotion compositions
npm run trailer:compositions

# Render the export-ready MP4
npm run trailer:render
```

Composition ID: `CompTextTownTrailer`

Soundtrack timing hooks are defined alongside the trailer constants so music, rain beds, kiln swells, replay granules, and logo chords can be synced during final audio production.

## Design principles

- Keep the first version small, playable, and atmospheric.
- Hide the AI infrastructure inside warm, diegetic village moments.
- Prefer emotional lighting, rain, kiln glow, and handmade texture over dashboard density.
- Make semantic compression legible through optional debug magic, not corporate UI.

## Roadmap

### Milestone 1 — Playable vertical slice

- [x] Project architecture and clean folder structure.
- [x] Phaser + TypeScript + Vite setup.
- [x] Initial tilemap-style village layout.
- [x] Controllable player.
- [x] Pottery workshop scene area.
- [x] One NPC with memory compression.
- [x] Basic dialogue.
- [x] Placeholder pixel assets.
- [x] CompText debug overlay.

### Milestone 2 — More village soul

- Add two more memorable NPCs: a kiln keeper and a shy courier.
- Add day/evening beat transitions and stronger rain ambience hooks.
- Replace generated placeholders with hand-authored spritesheets and tiles.
- Add lightweight save/load for inventory, relationships, and compressed NPC memories.

### Milestone 3 — Deeper CompText showcase

- Expand semantic retention scoring into per-topic memory heat.
- Add replay timeline inspection from an in-world ceramic ledger.
- Compare raw dialogue history with compressed memory shards.
- Add drift warnings as subtle lantern flicker and kiln-glass artifacts.

### Milestone 4 — Polished demo

- Add music and ambient audio implementation.
- Add title screen and credits.
- Improve accessibility options for text size and debug overlay visibility.
- Package for static hosting.
