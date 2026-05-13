import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {GlowOrb, Lantern, MemoryThreads, PixelMoon, PixelSprite} from '../components/Cinematic';

export const VillageSet: React.FC<{memory?: boolean}> = ({memory = false}) => {
  const frame = useCurrentFrame();
  const pan = interpolate(frame, [0, 150], [70, -95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div className="world-camera" style={{transform: `translateX(${pan}px) scale(1.08)`}}>
      <PixelMoon />
      <div className="distant-hills hill-a" />
      <div className="distant-hills hill-b" />
      <div className="rainy-skyline" />
      <div className="building tea-house"><span /></div>
      <div className="building pottery-shop"><span /></div>
      <div className="building kiln-house"><span /></div>
      <Lantern x={390} y={552} scale={1.1} />
      <Lantern x={790} y={510} scale={1.25} />
      <Lantern x={1324} y={570} scale={1.05} />
      <div className="cobblestone-road" />
      <div className="puddle puddle-a" />
      <div className="puddle puddle-b" />
      <div className="puddle puddle-c" />
      <PixelSprite className="hero-back" x={885} y={715} scale={3.6} />
      {memory ? <MemoryThreads intensity={0.5} village /> : null}
    </div>
  );
};

export const WorkshopSet: React.FC<{playerInside?: boolean; close?: boolean}> = ({playerInside = true, close = false}) => {
  const frame = useCurrentFrame();
  const push = close ? interpolate(frame, [0, 150], [0, -140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <div className="workshop-set" style={{transform: `translate(${push}px, ${close ? -30 : 0}px) scale(${close ? 1.18 : 1})`}}>
      <div className="workshop-wall" />
      <div className="shelf shelf-left" />
      <div className="shelf shelf-right" />
      <Lantern x={365} y={215} scale={1.45} />
      <Lantern x={1510} y={250} scale={1.2} />
      <div className="workbench" />
      <div className="pottery-wheel"><span /></div>
      <div className="clay-lump" />
      {playerInside ? <PixelSprite className="hero-side" x={790} y={650} scale={4.2} /> : null}
      <div className="window-rain" />
    </div>
  );
};

export const KilnSet: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.8 + Math.sin(frame / 6) * 0.18;
  return (
    <div className="kiln-set">
      <div className="kiln-shadow" />
      <div className="kiln" style={{filter: `drop-shadow(0 0 ${90 * glow}px rgba(255, 121, 62, 0.9))`}}>
        <span className="kiln-mouth" />
      </div>
      <GlowOrb x={825} y={455} color="rgba(255, 130, 66, 0.52)" size={310} />
      <div className="fired-bowls" />
    </div>
  );
};

export const VillagerSet: React.FC = () => (
  <div className="villager-set">
    <WorkshopSet playerInside={false} />
    <PixelSprite className="hero-side" x={700} y={665} scale={4} />
    <PixelSprite className="villager-mira" x={1020} y={650} scale={4} />
    <div className="dialogue-bubble">Mira remembers the cup you made in the storm.</div>
  </div>
);
