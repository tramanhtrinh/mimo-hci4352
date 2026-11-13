import { Redirect, Stack } from 'expo-router';

import { Palette } from '@/constants/theme';
import { useAuth } from '@/state/auth';

/** Login and sign-up. Already signed-in users skip straight to Home. */
export default function AuthLayout() {
  const { ready, user } = useAuth();

  if (!ready) return null;
  if (user) return <Redirect href="/home" />;

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.paper } }} />;
}
