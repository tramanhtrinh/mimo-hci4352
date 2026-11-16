/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * mimo uses a deliberately minimal, hand-drawn palette: ink on paper plus a
 * couple of soft grays. Every screen should pull colors from `Palette` only.
 */
export const Palette = {
  ink: '#1A1A1A',
  paper: '#F5F3EE',
  white: '#FFFFFF',
  shade: '#E0DFDB',
  muted: '#696865',
} as const;

/**
 * Two soft accents point the eye at what matters. They are only ever used as
 * backgrounds behind ink text (never as text colors), so contrast stays high.
 */
/**
 * Fill colors for small drawings only (care icons and Mimo's accessories), always inside
 * an ink outline. Interface surfaces stick to `Pastel`, so the screens stay calm.
 */
export const Tint = {
  rose: '#F6B3C2',
  apple: '#F59C9C',
  coral: '#F8B195',
  sun: '#FFDF6E',
  leaf: '#AEDB9F',
  sky: '#AFD3F2',
  lilac: '#CDBDF2',
} as const;

export const Pastel = {
  /** Primary, the sparks color: highlighted titles, today's target, and anything earned or kept. */
  butter: '#FFEFA8',
  /** Secondary, Mimo's color: its speech, its portrait and its happiness and energy. */
  blush: '#FFD9CF',
} as const;

// Light and dark intentionally share the same palette so the look stays consistent.
const scheme = {
  text: Palette.ink,
  background: Palette.paper,
  backgroundElement: Palette.shade,
  backgroundSelected: Palette.shade,
  textSecondary: Palette.muted,
} as const;

export const Colors = {
  light: scheme,
  dark: scheme,
} as const;

export const HandFonts = {
  regular: 'Gaegu_400Regular',
  bold: 'Gaegu_700Bold',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
