import { StyleSheet } from 'react-native';

import { HandFonts, Palette } from '@/constants/theme';

/** Shared layout for the login and sign-up screens. */
export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 14,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  sparkle: {
    position: 'absolute',
    top: 0,
    right: 80,
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 38,
    color: Palette.ink,
  },
  subtitle: {
    fontFamily: HandFonts.regular,
    fontSize: 18,
    textAlign: 'center',
    color: Palette.muted,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  link: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerText: {
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.muted,
  },
});
