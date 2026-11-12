import React from 'react';
import { Composition } from 'remotion';
import { Promo, TOTAL_FRAMES } from './Promo';
import { Story, STORY_FRAMES } from './Story';

export const Root: React.FC = () => (
  <>
    <Composition id="Story" component={Story} durationInFrames={STORY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Promo" component={Promo} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
