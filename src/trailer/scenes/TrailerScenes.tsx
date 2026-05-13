import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CinematicGrade, fadeForScene, Fog, GlowOrb, MemoryThreads, Rain, TitleCard} from '../components/Cinematic';
import {KilnSet, VillageSet, VillagerSet, WorkshopSet} from './PixelWorld';
import {palette} from '../constants';

const SceneShell: React.FC<{children: React.ReactNode; duration: number; className?: string}> = ({children, duration, className = ''}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className={`scene-shell ${className}`} style={{opacity: fadeForScene(frame, duration)}}>
      {children}
      <CinematicGrade />
    </AbsoluteFill>
  );
};

export const RainyVillageScene: React.FC<{duration: number}> = ({duration}) => (
  <SceneShell duration={duration} className="rainy-village-scene">
    <VillageSet />
    <Rain density={120} />
    <Fog count={18} />
    <TitleCard eyebrow="When the rain falls" title="the village listens" subtitle="cobblestones, lanterns, and old clay stories" />
  </SceneShell>
);

export const WorkshopArrivalScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const doorLight = interpolate(frame, [12, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneShell duration={duration} className="arrival-scene">
      <WorkshopSet />
      <div className="door-light" style={{opacity: doorLight}} />
      <Rain density={55} />
      <Fog count={12} warm />
      <TitleCard eyebrow="Step inside" title="warm hands, wet boots" subtitle="the workshop keeps every small ritual" />
    </SceneShell>
  );
};

export const PotteryCloseupScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const wheel = frame * 7;
  const cupRise = interpolate(frame, [20, 95], [52, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneShell duration={duration} className="pottery-closeup-scene">
      <WorkshopSet close />
      <div className="closeup-table">
        <div className="spinning-wheel" style={{transform: `rotate(${wheel}deg)`}} />
        <div className="forming-cup" style={{transform: `translateY(${cupRise}px)`}} />
        <div className="hands hands-left" />
        <div className="hands hands-right" />
      </div>
      <TitleCard eyebrow="Every shape" title="leaves a trace" subtitle="crafting becomes memory without becoming a dashboard" />
    </SceneShell>
  );
};

export const KilnGlowScene: React.FC<{duration: number}> = ({duration}) => (
  <SceneShell duration={duration} className="kiln-glow-scene">
    <KilnSet />
    <Fog count={20} warm />
    <Rain density={34} />
    <TitleCard eyebrow="Under the roof tiles" title="the kiln breathes" subtitle="retention pulses in ember-light" />
  </SceneShell>
);

export const VillagerMomentScene: React.FC<{duration: number}> = ({duration}) => (
  <SceneShell duration={duration} className="villager-moment-scene">
    <VillagerSet />
    <GlowOrb x={950} y={520} color="rgba(255, 226, 154, 0.36)" size={210} />
    <TitleCard eyebrow="A neighbor smiles" title="because yesterday mattered" subtitle="relationship memory, hidden under kindness" />
  </SceneShell>
);

export const MemoryRevealScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [15, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneShell duration={duration} className="memory-reveal-scene">
      <VillageSet memory />
      <Rain density={70} />
      <MemoryThreads intensity={reveal} village />
      <div className="memory-symbol shard-one">context</div>
      <div className="memory-symbol shard-two">care</div>
      <div className="memory-symbol shard-three">clay</div>
      <TitleCard eyebrow="Beneath the cobbles" title="semantic threads glow" subtitle="CompText feels like village magic, not machinery" />
    </SceneShell>
  );
};

export const ReplayTimelineScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [18, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneShell duration={duration} className="replay-scene">
      <div className="ceramic-ledger" />
      <div className="timeline-track">
        <span style={{width: `${progress * 100}%`}} />
        {['rain', 'clay', 'kiln', 'Mira', 'cup'].map((label, index) => (
          <b key={label} style={{left: `${12 + index * 19}%`, opacity: progress > index * 0.16 ? 1 : 0.2}}>{label}</b>
        ))}
      </div>
      <div className="replay-ghost replay-a" />
      <div className="replay-ghost replay-b" />
      <TitleCard eyebrow="Replay moments" title="return as quiet echoes" subtitle="the past animates like reflections in rainwater" />
    </SceneShell>
  );
};

export const SemanticMemoryScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const pulse = 0.7 + Math.sin(frame / 7) * 0.25;
  return (
    <SceneShell duration={duration} className="semantic-scene">
      <div className="semantic-map">
        <MemoryThreads intensity={1} />
        {['rain promise', 'favorite glaze', 'shared storm', 'fired cup', 'kindness'].map((label, index) => (
          <div key={label} className="semantic-node" style={{left: `${22 + (index % 3) * 25}%`, top: `${28 + Math.floor(index / 3) * 28}%`, transform: `scale(${pulse + index * 0.03})`}}>
            <span>{label}</span>
          </div>
        ))}
        <div className="retention-pulse" style={{boxShadow: `0 0 ${90 * pulse}px ${palette.memoryCyan}`}}>92% retained</div>
      </div>
      <TitleCard eyebrow="Compressed, not forgotten" title="meaning survives the storm" subtitle="memory graphs become constellations above the village" />
    </SceneShell>
  );
};

export const LogoRevealScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [25, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneShell duration={duration} className="logo-scene">
      <VillageSet memory />
      <Fog count={20} warm />
      <div className="logo-card" style={{opacity: glow, transform: `translateY(${interpolate(glow, [0, 1], [50, 0])}px)`}}>
        <h1>CompText Town</h1>
        <p>A village that remembers.</p>
      </div>
    </SceneShell>
  );
};
