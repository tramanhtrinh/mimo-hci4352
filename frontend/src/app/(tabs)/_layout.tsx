import { Tabs } from 'expo-router/js-tabs';

import { NavBar } from '@/components/mimo/nav-bar';
import { Palette } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <NavBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Palette.paper } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="pet" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="rewards" />
    </Tabs>
  );
}
