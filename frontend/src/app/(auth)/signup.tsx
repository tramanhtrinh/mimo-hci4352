import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authStyles as styles } from '@/components/mimo/auth-styles';
import { HighlightTitle } from '@/components/mimo/highlight-title';
import { Field, FormButton, FormNote } from '@/components/mimo/form';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { useAuth } from '@/state/auth';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [petName, setPetName] = useState('Mimo');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // On success the (auth) layout redirects to Home.
  const submit = async () => {
    if (password !== confirm) return setError('Passwords don’t match.');
    setBusy(true);
    setError(await signUp({ name, email, password, petName }));
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <MimoCharacter size={100} mood="calm" />
            <HighlightTitle textStyle={styles.title} style={{ alignSelf: 'center' }}>
              Create an account
            </HighlightTitle>
            <Text style={styles.subtitle}>Adopt a companion that grows when you put your phone down.</Text>
          </View>

          <Field label="Your name" value={name} onChangeText={setName} placeholder="Alex" autoCapitalize="words" autoComplete="name" />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Field
            label="Password"
            password
            value={password}
            onChangeText={setPassword}
            placeholder="at least 6 characters"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Field
            label="Confirm password"
            password
            value={confirm}
            onChangeText={setConfirm}
            placeholder="type it again"
            autoComplete="new-password"
          />
          <Field
            label="Name your companion"
            value={petName}
            onChangeText={setPetName}
            placeholder="Mimo"
            accessibilityHint="Optional. Leave it blank to use Mimo."
            autoCapitalize="words"
            maxLength={16}
            onSubmitEditing={submit}
          />

          <FormNote text={error} />
          <FormButton label="Create account" onPress={submit} busy={busy} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/login" replace asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.link}>Log in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
