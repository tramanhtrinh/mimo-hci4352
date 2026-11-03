import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

export type NavIconProps = {
  color: string;
  size?: number;
};

export function HomeIcon({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2.5 11.2 L12 3 L21.5 11.2 L19.8 13 L19 12.3 V21 H14.5 V15.5 H9.5 V21 H5 V12.3 L4.2 13 Z" fill={color} />
    </Svg>
  );
}

export function PawIcon({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Ellipse cx={5} cy={10} rx={2.2} ry={2.8} fill={color} />
      <Ellipse cx={9.2} cy={5.6} rx={2.3} ry={3} fill={color} />
      <Ellipse cx={14.8} cy={5.6} rx={2.3} ry={3} fill={color} />
      <Ellipse cx={19} cy={10} rx={2.2} ry={2.8} fill={color} />
      <Path
        d="M12 11.5 C15.5 11.5 18.5 15.5 18.5 18 C18.5 20.5 16 21 14.5 20.4 C13.2 19.9 10.8 19.9 9.5 20.4 C8 21 5.5 20.5 5.5 18 C5.5 15.5 8.5 11.5 12 11.5 Z"
        fill={color}
      />
    </Svg>
  );
}

export function GoalsIcon({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9.5} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M7.5 12.2 L10.6 15.2 L16.5 9" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ProgressIcon({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2.5 19 L8 13.5 L12 16.5 L19.5 9" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 1.5 C17.4 3.6 18.4 4.6 20.5 5 C18.4 5.4 17.4 6.4 17 8.5 C16.6 6.4 15.6 5.4 13.5 5 C15.6 4.6 16.6 3.6 17 1.5 Z" fill={color} />
      <Circle cx={6} cy={6} r={1.1} fill={color} />
      <Circle cx={11} cy={3.5} r={0.9} fill={color} />
      <Circle cx={22} cy={11.5} r={0.9} fill={color} />
    </Svg>
  );
}

export function RewardsIcon({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={8.5} width={18} height={4} rx={1} fill="none" stroke={color} strokeWidth={2} />
      <Rect x={4.5} y={12.5} width={15} height={8.5} rx={1} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M12 8.5 V21" stroke={color} strokeWidth={2} />
      <Path
        d="M12 8.5 C10.5 5 7.5 4 6.8 5.8 C6.2 7.4 9 8.5 12 8.5 C15 8.5 17.8 7.4 17.2 5.8 C16.5 4 13.5 5 12 8.5 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
