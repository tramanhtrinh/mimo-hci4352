import { StyleSheet, Text, View } from 'react-native';

import { Sparkle } from '@/components/mimo/decorations';
import { HandFonts, Palette } from '@/constants/theme';
import { usePet } from '@/state/pet';

/** Shows the current spark balance. Sparks are earned by finishing goals. */
export function SparksPill() {
  const { sparks } = usePet();

  return (
    <View style={styles.pill}>
      <Sparkle size={12} />
      <Text style={styles.text}>{sparks} sparks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  text: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },
});
