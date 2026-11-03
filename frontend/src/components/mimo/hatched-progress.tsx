import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { Palette } from '@/constants/theme';

type Props = {
  /** How full the bar ends up, from 0 to 1. */
  value?: number;
  /** How long the bar takes to fill, in milliseconds. */
  duration?: number;
  onComplete?: () => void;
};

/** A rounded loading bar filled with diagonal hatching, like a pen sketch. */
export function HatchedProgress({ value = 1, duration = 2800, onComplete }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => finished && onComplete?.());
    return () => animation.stop();
  }, [duration, onComplete, progress, value]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { width }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="hatch" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Line x1={0} y1={0} x2={0} y2={7} stroke={Palette.ink} strokeWidth={3} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#hatch)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    borderRadius: 11,
    backgroundColor: Palette.white,
    overflow: 'hidden',
    padding: 2,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderRightWidth: 2,
    borderColor: Palette.ink,
  },
});
