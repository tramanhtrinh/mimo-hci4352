import Svg, { Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';

/** Four-point sparkle used as a small accent. */
export function Sparkle({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z"
        fill={Palette.ink}
      />
    </Svg>
  );
}

/** A short hand-drawn tilde squiggle, used to bracket captions. */
export function Squiggle({ width = 26 }: { width?: number }) {
  return (
    <Svg width={width} height={width * 0.4} viewBox="0 0 26 10">
      <Path
        d="M2 7 C6 1 10 1 13 5 C16 9 20 9 24 3"
        fill="none"
        stroke={Palette.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Dashed wave line above a solid ink hill, anchored to the bottom of a screen. */
export function GroundWaves({ height = 150 }: { height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 400 150" preserveAspectRatio="none">
      <Path
        d="M0 52 C70 62 130 30 210 22 C290 14 340 40 400 30"
        fill="none"
        stroke={Palette.ink}
        strokeWidth={2.5}
        strokeDasharray="8 6"
      />
      <Path
        d="M0 76 C90 92 170 84 250 58 C320 36 370 48 400 60 L400 150 L0 150 Z"
        fill={Palette.ink}
      />
    </Svg>
  );
}
