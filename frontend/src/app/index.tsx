import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroundWaves, Sparkle, Squiggle } from '@/components/mimo/decorations';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoBear } from '@/components/mimo/mimo-bear';
import { HandFonts, Palette } from '@/constants/theme';

/** Opening / loading screen. Moves on to Home once the bar fills. */
export default function OpeningScreen() {
  const { width } = useWindowDimensions();
  // `replace` so the back gesture from Home doesn't return to the loader.
  const goHome = useCallback(() => router.replace('/home'), []);
  const contentWidth = Math.min(width, 430);
  const bearSize = Math.min(contentWidth - 48, 340);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={[styles.content, { width: contentWidth }]} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.sparkle}>
            <Sparkle size={22} />
          </View>
          <Text style={styles.title}>mimo</Text>
          <View style={styles.taglineRow}>
            <Squiggle />
            <Text style={styles.tagline}>gentle digital companion</Text>
            <Squiggle />
          </View>
        </View>

        <MimoBear size={bearSize} />

        <View style={[styles.loading, { width: bearSize * 0.82 }]}>
          <Text style={styles.loadingLabel}>loading . . .</Text>
          <HatchedProgress onComplete={goHome} />
        </View>
      </SafeAreaView>

      <View style={styles.ground}>
        <GroundWaves />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Palette.paper,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
    gap: 28,
  },
  header: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  sparkle: {
    position: 'absolute',
    top: -16,
    right: 76,
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: 2,
    color: Palette.ink,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagline: {
    fontFamily: HandFonts.regular,
    fontSize: 20,
    color: Palette.ink,
  },
  loading: {
    alignItems: 'center',
    gap: 8,
  },
  loadingLabel: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    color: Palette.ink,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
