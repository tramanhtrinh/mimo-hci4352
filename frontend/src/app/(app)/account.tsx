import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Field, FormButton, FormNote } from '@/components/mimo/form';
import { MimoPet } from '@/components/mimo/mimo-pet';
import { HandFonts, Palette } from '@/constants/theme';
import { useAuth } from '@/state/auth';
import { usePet } from '@/state/pet';

type Note = { text: string; kind: 'error' | 'success' } | null;

/** Profile, password, log out and delete: simulated account management. */
export default function AccountScreen() {
  const { user, logOut } = useAuth();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  // The (app) layout redirects to login as soon as the session ends.
  if (!user) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={close} hitSlop={12}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
        <Text style={styles.heading}>Account</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProfileCard />
        <EditProfile />
        <ChangePassword />

        <FormButton label="Log out" variant="outline" onPress={logOut} />

        <DeleteAccount />
        <Text style={styles.footnote}>
          Prototype: accounts are saved only on this device. Nothing is sent anywhere.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileCard() {
  const { user } = useAuth();
  const { name: petName, stage, level, streakDays, sparks } = usePet();
  if (!user) return null;
  const since = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <View style={styles.profile}>
      <View style={styles.avatar}>
        <MimoPet size={70} />
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.since}>Member since {since}</Text>
      <View style={styles.stats}>
        <Stat value={`Lv ${level}`} label={`${petName} the ${stage}`} />
        <Stat value={`${streakDays}`} label="day streak" />
        <Stat value={`${sparks}`} label="sparks" />
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EditProfile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [petName, setPetName] = useState(user?.petName ?? '');
  const [note, setNote] = useState<Note>(null);

  const save = async () => {
    const error = await updateProfile({ name, email, petName });
    setNote(error ? { text: error, kind: 'error' } : { text: 'Profile saved.', kind: 'success' });
  };

  return (
    <Section title="Profile">
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Companion's name" value={petName} onChangeText={setPetName} autoCapitalize="words" maxLength={16} />
      <FormNote text={note?.text ?? null} kind={note?.kind} />
      <FormButton label="Save profile" onPress={save} />
    </Section>
  );
}

function ChangePassword() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [note, setNote] = useState<Note>(null);

  const save = async () => {
    if (next !== confirm) return setNote({ text: 'New passwords don’t match.', kind: 'error' });
    const error = await changePassword(current, next);
    if (error) return setNote({ text: error, kind: 'error' });
    setCurrent('');
    setNext('');
    setConfirm('');
    setNote({ text: 'Password updated.', kind: 'success' });
  };

  return (
    <Section title="Change password">
      <Field label="Current password" password value={current} onChangeText={setCurrent} autoComplete="current-password" />
      <Field label="New password" password value={next} onChangeText={setNext} autoComplete="new-password" />
      <Field label="Confirm new password" password value={confirm} onChangeText={setConfirm} autoComplete="new-password" />
      <FormNote text={note?.text ?? null} kind={note?.kind} />
      <FormButton label="Update password" onPress={save} />
    </Section>
  );
}

function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const { name: petName } = usePet();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} hitSlop={8}>
        <Text style={styles.deleteLink}>Delete account</Text>
      </Pressable>
    );
  }

  return (
    <Section title="Delete account">
      <Text style={styles.warning}>
        This removes your account, {petName}, your goals and your sparks from this device. It can&apos;t be undone.
      </Text>
      <Field label="Enter your password to confirm" password value={password} onChangeText={setPassword} />
      <FormNote text={error} />
      <FormButton label="Delete my account" variant="danger" onPress={async () => setError(await deleteAccount(password))} />
      <Pressable onPress={() => setOpen(false)} hitSlop={8}>
        <Text style={styles.deleteLink}>Keep my account</Text>
      </Pressable>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  close: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.muted,
  },
  heading: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
  topSpacer: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 20,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  profile: {
    alignItems: 'center',
    gap: 2,
    padding: 20,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontFamily: HandFonts.bold,
    fontSize: 28,
    color: Palette.ink,
  },
  email: {
    fontFamily: HandFonts.regular,
    fontSize: 17,
    color: Palette.ink,
  },
  since: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: 14,
    borderTopWidth: 2,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
    paddingTop: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: HandFonts.bold,
    fontSize: 22,
    color: Palette.ink,
  },
  statLabel: {
    fontFamily: HandFonts.regular,
    fontSize: 14,
    textAlign: 'center',
    color: Palette.muted,
  },

  section: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  sectionTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 22,
    color: Palette.ink,
  },
  warning: {
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.ink,
  },
  deleteLink: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.muted,
    textDecorationLine: 'underline',
  },
  footnote: {
    textAlign: 'center',
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },
});
