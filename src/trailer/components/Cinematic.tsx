import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {palette, soundtrackCues} from '../constants';

export const fadeForScene = (frame: number, duration: number, fade = 22) => {
  const fadeIn = interpolate(frame, [0, fade], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [duration - fade, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return Math.min(fadeIn, fadeOut);
};

export const CinematicGrade: React.FC = () => (
  <AbsoluteFill className="cinematic-grade">
    <div className="vignette" />
    <div className="letterbox letterbox-top" />
    <div className="letterbox letterbox-bottom" />
    <div className="film-grain" />
  </AbsoluteFill>
);

export const Rain: React.FC<{density?: number; wind?: number}> = ({density = 90, wind = -18}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="rain-layer">
      {Array.from({length: density}).map((_, index) => {
        const left = (index * 37) % 100;
        const top = ((index * 73 + frame * (3 + (index % 3))) % 120) - 10;
        const opacity = 0.22 + (index % 5) * 0.05;
        const height = 46 + (index % 4) * 14;
        return (
          <i
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="rain-streak"
            style={{left: `${left}%`, top: `${top}%`, height, opacity, transform: `rotate(${wind}deg)`}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Fog: React.FC<{count?: number; warm?: boolean}> = ({count = 16, warm = false}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="fog-layer">
      {Array.from({length: count}).map((_, index) => {
        const drift = Math.sin((frame + index * 29) / 64) * 42;
        const left = (index * 17) % 100;
        const top = 52 + (index % 6) * 7;
        return (
          <b
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={warm ? 'fog-puff fog-warm' : 'fog-puff'}
            style={{left: `calc(${left}% + ${drift}px)`, top: `${top}%`, transform: `scale(${1 + (index % 5) * 0.18})`}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const PixelMoon: React.FC = () => <div className="pixel-moon" />;

export const Lantern: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => {
  const frame = useCurrentFrame();
  const glow = 0.82 + Math.sin(frame / 9 + x) * 0.12;
  return (
    <div className="lantern" style={{left: x, top: y, transform: `scale(${scale})`, opacity: glow}}>
      <span className="lantern-core" />
    </div>
  );
};

export const MemoryThreads: React.FC<{intensity?: number; village?: boolean}> = ({intensity = 1, village = false}) => {
  const frame = useCurrentFrame();
  const paths = [
    'M120 680 C420 500 610 740 880 560 S1310 430 1640 650',
    'M230 390 C470 280 720 420 970 310 S1360 270 1710 450',
    'M360 820 C650 700 740 910 1010 780 S1400 740 1730 900',
  ];
  return (
    <svg className={village ? 'memory-threads village-threads' : 'memory-threads'} viewBox="0 0 1920 1080">
      {paths.map((d, index) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: interpolate(frame - index * 12, [0, 80], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            opacity: intensity * (0.35 + index * 0.13),
          }}
        />
      ))}
      {Array.from({length: 14}).map((_, index) => {
        const pulse = 0.62 + Math.sin(frame / 8 + index) * 0.28;
        return <circle key={index} cx={180 + ((index * 131) % 1500)} cy={330 + ((index * 83) % 470)} r={7 + pulse * 9} opacity={intensity * pulse} />;
      })}
    </svg>
  );
};

export const SoundtrackCueOverlay: React.FC<{enabled?: boolean}> = ({enabled = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!enabled) {
    return null;
  }
  const active = [...soundtrackCues].reverse().find((cue) => frame >= cue.frame) ?? soundtrackCues[0];
  return (
    <div className="soundtrack-cue">
      <span>{Math.floor(frame / fps)}s</span>
      <strong>{active.cue}</strong>
    </div>
  );
};

export const TitleCard: React.FC<{eyebrow?: string; title: string; subtitle?: string; align?: 'left' | 'center'}> = ({eyebrow, title, subtitle, align = 'left'}) => (
  <div className={`title-card title-${align}`}>
    {eyebrow ? <p>{eyebrow}</p> : null}
    <h2>{title}</h2>
    {subtitle ? <span>{subtitle}</span> : null}
  </div>
);

export const PixelSprite: React.FC<{className: string; x: number; y: number; scale?: number}> = ({className, x, y, scale = 1}) => (
  <div className={`pixel-sprite ${className}`} style={{left: x, top: y, transform: `scale(${scale})`}} />
);

export const GlowOrb: React.FC<{x: number; y: number; color?: string; size?: number}> = ({x, y, color = palette.memoryCyan, size = 80}) => (
  <div className="glow-orb" style={{left: x, top: y, width: size, height: size, background: color}} />
);
