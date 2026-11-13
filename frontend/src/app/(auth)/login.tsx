import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authStyles as styles } from '@/components/mimo/auth-styles';
import { Sparkle } from '@/components/mimo/decorations';
import { Field, FormButton, FormNote } from '@/components/mimo/form';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { DEMO_ACCOUNT, useAuth, validateEmail } from '@/state/auth';

export default function LoginScreen() {
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // On success the (auth) layout redirects to Home.
  const submit = async (e = email, p = password) => {
    setNotice(null);
    setBusy(true);
    setError(await logIn(e, p));
    setBusy(false);
  };

  const useDemo = () => {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    submit(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  };

  // Simulated: no email is actually sent.
  const forgot = () => {
    setError(null);
    const problem = validateEmail(email);
    setNotice(
      problem
        ? 'Type your email above and tap “Forgot password?” again.'
        : `Reset link sent to ${email.trim()} (simulated in this prototype).`,
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.sparkle}>
              <Sparkle size={18} />
            </View>
            <MimoCharacter size={110} mood="joyful" />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Mimo missed you. Log in to keep your streak going.</Text>
          </View>

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
            placeholder="your password"
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={() => submit()}
          />

          <Pressable onPress={forgot} hitSlop={8} style={styles.forgot}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <FormNote text={error} />
          <FormNote text={notice} kind="success" />

          <FormButton label="Log in" onPress={() => submit()} busy={busy} />
          <FormButton label="Try the demo account" onPress={useDemo} variant="outline" />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to mimo?</Text>
            <Link href="/signup" replace asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.link}>Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
