import { continueRender, delayRender, staticFile } from 'remotion';
import { FONT_FACES } from './fontFaces';

// Bundled fonts (public/fonts), loaded before the first frame is rendered
const handle = delayRender('Loading fonts');
Promise.all(
  FONT_FACES.map((f) => {
    const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, { weight: f.weight, unicodeRange: f.range });
    return face.load().then((loaded) => (document.fonts as any).add(loaded));
  })
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });

export const frank = "'Frank Ruhl Libre', serif";
export const assistant = "'Assistant', sans-serif";

export const C = {
  brown: '#78350f',
  brownDark: '#451a03',
  amber: '#b45309',
  gold: '#d6a76a',
  cream: '#fffbeb',
  parchment: '#fbf3e1',
  ink: '#292524',
  green: '#059669',
};
