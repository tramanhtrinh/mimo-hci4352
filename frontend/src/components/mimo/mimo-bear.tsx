import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';
import type { AccessoryId } from '@/state/shop';

export type BearMood = 'joyful' | 'calm' | 'sad' | 'sleepy';

type Props = {
  size?: number;
  mood?: BearMood;
  /** Something Mimo is wearing, bought with sparks. */
  accessory?: AccessoryId | null;
};

const stroke = { stroke: Palette.ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** The bear's shapes, drawn in a 320×320 coordinate space. */
function BearShapes({ mood = 'calm', accessory }: { mood?: BearMood; accessory?: AccessoryId | null }) {
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
      {accessory && <Accessory id={accessory} />}
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

/** Accessories drawn in the same 320×320 space as the bear. */
function Accessory({ id }: { id: AccessoryId }) {
  const ink = { stroke: Palette.ink, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

  switch (id) {
    case 'bow':
      return (
        <G>
          <Path d="M200 74 L176 60 L180 88 Z" fill={Palette.white} {...ink} />
          <Path d="M200 74 L224 60 L220 88 Z" fill={Palette.white} {...ink} />
          <Circle cx={200} cy={74} r={6} fill={Palette.ink} />
        </G>
      );
    case 'scarf':
      return (
        <G>
          <Path d="M100 168 C130 182 190 182 220 168 L222 186 C190 200 130 200 98 186 Z" fill={Palette.shade} {...ink} />
          <Path d="M182 188 L192 226 L174 228 L168 192 Z" fill={Palette.shade} {...ink} />
          <Path d="M120 178 L118 192 M140 182 L139 196 M160 183 L160 197 M200 180 L202 194" {...ink} strokeWidth={2} />
        </G>
      );
    case 'glasses':
      return (
        <G>
          <Circle cx={142} cy={136} r={17} fill="none" {...ink} />
          <Circle cx={180} cy={136} r={17} fill="none" {...ink} />
          <Path d="M159 134 Q161 130 163 134" fill="none" {...ink} />
          <Path d="M125 132 L104 126 M197 132 L218 126" {...ink} />
        </G>
      );
    case 'flower':
      return (
        <G>
          <Path d="M112 88 C135 72 185 72 208 88" fill="none" {...ink} strokeWidth={3} />
          {[118, 140, 160, 180, 202].map((x, i) => {
            const y = i === 0 || i === 4 ? 86 : i === 2 ? 74 : 78;
            return (
              <G key={x}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <Circle
                    key={a}
                    cx={x + 7 * Math.cos((a * Math.PI) / 180)}
                    cy={y + 7 * Math.sin((a * Math.PI) / 180)}
                    r={5}
                    fill={Palette.white}
                    stroke={Palette.ink}
                    strokeWidth={2}
                  />
                ))}
                <Circle cx={x} cy={y} r={3.5} fill={Palette.ink} />
              </G>
            );
          })}
        </G>
      );
    case 'hat':
      return (
        <G>
          <Path d="M136 86 L172 26 L194 82 Z" fill={Palette.white} {...ink} />
          <Path d="M148 66 L182 58 M141 78 L188 68" {...ink} strokeWidth={2.5} />
          <Circle cx={172} cy={24} r={8} fill={Palette.ink} />
        </G>
      );
  }
}

/** Just the bear, cropped tight, for avatars and cards. */
export function MimoCharacter({ size = 120, mood, accessory }: Props) {
  // tall accessories need a little more headroom
  const viewBox = accessory === 'hat' ? '55 12 210 253' : accessory === 'flower' ? '68 50 184 215' : '70 60 180 205';
  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      <BearShapes mood={mood} accessory={accessory} />
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
