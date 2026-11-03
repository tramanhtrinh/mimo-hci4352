import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GoalsIcon,
  HomeIcon,
  type NavIconProps,
  PawIcon,
  ProgressIcon,
  RewardsIcon,
} from '@/components/mimo/nav-icons';
import { HandFonts, Palette } from '@/constants/theme';

/** Tab route name → icon and label. Order follows the route order in the tabs layout. */
const TABS: Record<string, { label: string; Icon: ComponentType<NavIconProps> }> = {
  home: { label: 'Home', Icon: HomeIcon },
  pet: { label: 'Pet', Icon: PawIcon },
  goals: { label: 'Goals', Icon: GoalsIcon },
  progress: { label: 'Progress', Icon: ProgressIcon },
  rewards: { label: 'Rewards', Icon: RewardsIcon },
};

/**
 * Bottom navigation bar: icons only, with the active tab expanded into an
 * ink pill that also shows its label.
 */
export function NavBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;

        const focused = index === state.index;
        const { Icon, label } = tab;

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            role="tab"
            aria-selected={focused}
            accessibilityLabel={label}
            hitSlop={8}
            style={({ pressed }) => [styles.item, focused && styles.itemActive, pressed && styles.pressed]}>
            <Icon color={focused ? Palette.white : Palette.ink} size={24} />
            {focused && <Text style={styles.label}>{label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: Palette.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderColor: Palette.ink,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    minWidth: 44,
    justifyContent: 'center',
    borderRadius: 22,
  },
  itemActive: {
    backgroundColor: Palette.ink,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.white,
  },
});
