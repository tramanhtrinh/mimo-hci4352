import { type StyleProp, StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';

import { HandFonts, Palette, Pastel } from '@/constants/theme';

type Props = {
  children: string;
  /** Marker color behind the lower half of the text. */
  color?: string;
  /** Turns the marker off while keeping the layout, e.g. for a goal not kept yet. */
  on?: boolean;
  /** Overrides the default section-title text style. */
  textStyle?: StyleProp<TextStyle>;
  /** Announce as a heading to screen readers. On by default, since most uses are section titles. */
  header?: boolean;
  /** Wrapper style, e.g. { alignSelf: 'center' } on centered screens. */
  style?: StyleProp<ViewStyle>;
};

/** Text with a pastel highlighter stroke behind it: the app's main way of drawing the eye. */
export function HighlightTitle({ children, color = Pastel.butter, on = true, textStyle, header = true, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {on && <View style={[styles.marker, { backgroundColor: color }]} />}
      <Text style={[styles.title, textStyle]} accessibilityRole={header ? 'header' : undefined}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  marker: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 3,
    height: '50%',
    borderRadius: 6,
    transform: [{ rotate: '-1deg' }],
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
});
