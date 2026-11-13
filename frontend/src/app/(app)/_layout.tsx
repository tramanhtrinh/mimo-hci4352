import { Redirect, Stack } from 'expo-router';

import { Palette } from '@/constants/theme';
import { useAuth } from '@/state/auth';
import { PetProvider } from '@/state/pet';

/** Everything behind sign-in. Each user gets their own saved pet and goals. */
export default function AppLayout() {
  const { ready, user } = useAuth();

  if (!ready) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    // keyed by user so switching accounts never shows the previous user's pet
    <PetProvider key={user.id} userId={user.id} petName={user.petName}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.paper } }}>
        <Stack.Screen name="(tabs)" />
        {/* no swipe-back mid-session; the session has its own way out */}
        <Stack.Screen name="focus" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="goal-editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="account" options={{ presentation: 'modal' }} />
      </Stack>
    </PetProvider>
  );
}
