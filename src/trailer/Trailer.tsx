import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SoundtrackCueOverlay} from './components/Cinematic';
import {sceneDurations} from './constants';
import {
  KilnGlowScene,
  LogoRevealScene,
  MemoryRevealScene,
  PotteryCloseupScene,
  RainyVillageScene,
  ReplayTimelineScene,
  SemanticMemoryScene,
  VillagerMomentScene,
  WorkshopArrivalScene,
} from './scenes/TrailerScenes';

type TrailerProps = {
  showSoundtrackCues?: boolean;
};

const orderedScenes = [
  ['rainyVillage', RainyVillageScene],
  ['workshopArrival', WorkshopArrivalScene],
  ['potteryCloseup', PotteryCloseupScene],
  ['kilnGlow', KilnGlowScene],
  ['villagerMoment', VillagerMomentScene],
  ['memoryReveal', MemoryRevealScene],
  ['replayTimeline', ReplayTimelineScene],
  ['semanticMemory', SemanticMemoryScene],
  ['logoReveal', LogoRevealScene],
] as const;

export const CompTextTownTrailer: React.FC<TrailerProps> = ({showSoundtrackCues = false}) => {
  let cursor = 0;
  return (
    <AbsoluteFill className="trailer-root">
      {orderedScenes.map(([key, Component]) => {
        const duration = sceneDurations[key];
        const from = cursor;
        cursor += duration;
        return (
          <Sequence key={key} from={from} durationInFrames={duration}>
            <Component duration={duration} />
          </Sequence>
        );
      })}
      <SoundtrackCueOverlay enabled={showSoundtrackCues} />
    </AbsoluteFill>
  );
};
