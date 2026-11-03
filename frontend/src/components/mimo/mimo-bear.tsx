import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';

export type BearMood = 'joyful' | 'calm' | 'sad' | 'sleepy';

type Props = {
  size?: number;
  mood?: BearMood;
};

const stroke = { stroke: Palette.ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** The bear's shapes, drawn in a 320×320 coordinate space. */
function BearShapes({ mood = 'calm' }: { mood?: BearMood }) {
  return (
    <G>
      {/* ears, arms and feet sit behind the body so its outline covers the overlap */}
      <Circle cx={118} cy={96} r={22} fill={Palette.white} {...stroke} />
      <Circle cx={202} cy={96} r={22} fill={Palette.white} {...stroke} />
      <Ellipse cx={100} cy={200} rx={12} ry={26} fill={Palette.white} transform="rotate(14 100 200)" {...stroke} />
      <Ellipse cx={220} cy={200} rx={12} ry={26} fill={Palette.white} transform="rotate(-14 220 200)" {...stroke} />
      <Ellipse cx={128} cy={246} rx={16} ry={13} fill={Palette.white} {...stroke} />
      <Ellipse cx={192} cy={246} rx={16} ry={13} fill={Palette.white} {...stroke} />

      {/* body */}
      <Path
        d="M160 80 C204 80 224 108 222 142 C220 166 228 192 225 216 C222 242 200 250 160 250 C120 250 98 242 95 216 C92 192 100 166 98 142 C96 108 116 80 160 80 Z"
        fill={Palette.white}
        {...stroke}
      />

      {/* face */}
      <Face mood={mood} />
    </G>
  );
}

function Face({ mood }: { mood: BearMood }) {
  const line = { fill: 'none', stroke: Palette.ink, strokeWidth: 3.5, strokeLinecap: 'round' as const };

  if (mood === 'joyful') {
    // closed, smiling eyes and a wide grin
    return (
      <G>
        <Path d="M132 138 Q142 124 152 138" {...line} />
        <Path d="M170 138 Q180 124 190 138" {...line} />
        <Path d="M148 156 Q161 170 174 156" {...line} />
      </G>
    );
  }

  if (mood === 'sleepy') {
    // droopy closed eyes and a small yawn
    return (
      <G>
        <Path d="M132 134 Q142 142 152 134" {...line} />
        <Path d="M170 134 Q180 142 190 134" {...line} />
        <Ellipse cx={161} cy={160} rx={5} ry={6} fill={Palette.ink} />
      </G>
    );
  }

  return (
    <G>
      <Ellipse cx={142} cy={136} rx={10} ry={13} fill={Palette.ink} />
      <Ellipse cx={180} cy={136} rx={10} ry={13} fill={Palette.ink} />
      <Circle cx={145} cy={131} r={3.5} fill={Palette.white} />
      <Circle cx={183} cy={131} r={3.5} fill={Palette.white} />
      {mood === 'sad' ? (
        <G>
          <Path d="M152 164 Q161 156 170 164" {...line} strokeWidth={3} />
          <Path d="M128 118 L140 114" {...line} strokeWidth={3} />
          <Path d="M194 118 L182 114" {...line} strokeWidth={3} />
        </G>
      ) : (
        <Path d="M152 158 Q161 166 170 158" {...line} strokeWidth={3} />
      )}
    </G>
  );
}

/** Just the bear, cropped tight, for avatars and cards. */
export function MimoCharacter({ size = 120, mood }: Props) {
  return (
    <Svg width={size} height={size} viewBox="70 60 180 205">
      <BearShapes mood={mood} />
    </Svg>
  );
}

/**
 * The mimo bear sitting inside its hand-drawn frame: a dashed outer outline,
 * a solid tilted blob and a soft gray shadow behind the character.
 */
export function MimoBear({ size = 320 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 320 320">
      {/* dashed outer outline */}
      <Path
        d="M40 78 C100 24 252 22 288 96 C314 156 294 246 232 282 C170 308 70 296 34 236 C8 186 10 106 40 78 Z"
        fill="none"
        stroke={Palette.muted}
        strokeWidth={2}
        strokeDasharray="6 6"
        transform="rotate(6 160 160)"
      />
      {/* solid frame */}
      <Path
        d="M58 66 C120 34 232 34 266 76 C296 116 290 214 244 260 C202 296 112 296 62 254 C26 218 20 96 58 66 Z"
        fill={Palette.paper}
        transform="rotate(-8 160 160)"
        {...stroke}
      />
      {/* soft shadow */}
      <Ellipse
        cx={164}
        cy={168}
        rx={118}
        ry={88}
        fill={Palette.shade}
        transform="rotate(-32 164 168)"
      />
      <BearShapes />
    </Svg>
  );
}
