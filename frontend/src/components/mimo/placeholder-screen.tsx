import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/mimo/decorations';
import { HandFonts, Palette } from '@/constants/theme';

/** Temporary screen for tabs that haven't been designed yet. */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.center}>
        <Sparkle size={22} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.caption}>coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 36,
    color: Palette.ink,
  },
  caption: {
    fontFamily: HandFonts.regular,
    fontSize: 18,
    color: Palette.muted,
  },
});
