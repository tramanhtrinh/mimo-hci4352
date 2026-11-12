import { Pressable, StyleSheet, Text } from 'react-native';

import { HandFonts, Palette } from '@/constants/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Round single-letter chip, used for days of the week. */
  round?: boolean;
};

/** Outlined pill that fills with ink when selected. */
export function ChoiceChip({ label, selected, onPress, round }: Props) {
  return (
    <Pressable
      onPress={onPress}
      role={round ? 'checkbox' : 'radio'}
      aria-checked={selected}
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        round && styles.round,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  round: {
    width: 38,
    height: 38,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: Palette.ink,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  textSelected: {
    color: Palette.white,
  },
});
