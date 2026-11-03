import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { HandFonts, Palette } from '@/constants/theme';

type IconProps = {
  size?: number;
  color?: string;
};

const line = (color: string, width = 2) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HeartIcon({ size = 18, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20 C5 15 3 11.5 3 8.5 C3 5.5 5.5 3.8 7.8 3.8 C9.6 3.8 11 5 12 6.6 C13 5 14.4 3.8 16.2 3.8 C18.5 3.8 21 5.5 21 8.5 C21 11.5 19 15 12 20 Z" {...line(color)} />
    </Svg>
  );
}

export function SmileIcon({ size = 18, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...line(color)} />
      <Circle cx={9} cy={10} r={1.2} fill={color} />
      <Circle cx={15} cy={10} r={1.2} fill={color} />
      <Path d="M8.5 14 Q12 17.5 15.5 14" {...line(color)} />
    </Svg>
  );
}

export function BoltIcon({ size = 18, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13.5 2.5 L5 13.5 H11 L10 21.5 L19 10 H13 Z" {...line(color)} />
    </Svg>
  );
}

export function AppleIcon({ size = 18, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 7.5 C9 5.5 4.5 6.5 4.5 11.5 C4.5 16.5 8 21 10.5 20.5 C11.3 20.3 12.7 20.3 13.5 20.5 C16 21 19.5 16.5 19.5 11.5 C19.5 6.5 15 5.5 12 7.5 Z" {...line(color)} />
      <Path d="M12 7.5 C12 5.5 12.5 4 14 2.8" {...line(color)} />
      <Path d="M12.8 5 C14.5 3.5 17 3.8 17.5 4.5 C16.5 6 14.5 6.2 12.8 5 Z" fill={color} />
    </Svg>
  );
}

export function BallIcon({ size = 18, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...line(color)} />
      <Path d="M5 6 C9 9 9 15 5 18" {...line(color, 1.6)} />
      <Path d="M19 6 C15 9 15 15 19 18" {...line(color, 1.6)} />
      <Path d="M3.5 12 H20.5" {...line(color, 1.6)} />
    </Svg>
  );
}

export function ZzzIcon({ size = 18, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <SvgText x={2} y={19} fontSize={12} fontFamily={HandFonts.bold} fill={color}>
        z
      </SvgText>
      <SvgText x={9} y={14} fontSize={10} fontFamily={HandFonts.bold} fill={color}>
        z
      </SvgText>
      <SvgText x={15} y={9} fontSize={8} fontFamily={HandFonts.bold} fill={color}>
        z
      </SvgText>
    </Svg>
  );
}

export function ChevronRight({ size = 16, color = Palette.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M6 3 L11 8 L6 13" {...line(color, 2.4)} />
    </Svg>
  );
}
