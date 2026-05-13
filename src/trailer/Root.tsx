import React from 'react';
import {Composition} from 'remotion';
import {CompTextTownTrailer} from './Trailer';
import {TRAILER_DURATION_FRAMES, TRAILER_FPS, TRAILER_HEIGHT, TRAILER_WIDTH} from './constants';
import './trailer.css';

export const TrailerRoot: React.FC = () => {
  return (
    <Composition
      id="CompTextTownTrailer"
      component={CompTextTownTrailer}
      durationInFrames={TRAILER_DURATION_FRAMES}
      fps={TRAILER_FPS}
      width={TRAILER_WIDTH}
      height={TRAILER_HEIGHT}
      defaultProps={{showSoundtrackCues: false}}
    />
  );
};
