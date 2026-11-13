import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { HandFonts, Palette } from '@/constants/theme';

type FieldProps = TextInputProps & {
  label: string;
  /** Show a show/hide toggle and mask the text. */
  password?: boolean;
};

/** Labelled text input in the sketchbook style. */
export function Field({ label, password, style, ...input }: FieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={Palette.muted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={password && hidden}
          aria-label={label}
          style={[styles.input, style]}
          {...input}
        />
        {password && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} style={styles.toggle}>
            <Text style={styles.toggleText}>{hidden ? 'show' : 'hide'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  busy?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
};

export function FormButton({ label, onPress, busy, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.button,
        variant !== 'primary' && styles.buttonOutline,
        (pressed || busy) && styles.pressed,
      ]}>
      <Text style={[styles.buttonText, variant !== 'primary' && styles.buttonTextOutline]}>
        {busy ? 'One moment…' : label}
      </Text>
    </Pressable>
  );
}

/** Inline error or success line under a form. */
export function FormNote({ text, kind = 'error' }: { text: string | null; kind?: 'error' | 'success' }) {
  if (!text) return null;
  return (
    <View style={[styles.note, kind === 'success' && styles.noteSuccess]}>
      <Text style={[styles.noteText, kind === 'success' && styles.noteTextSuccess]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  inputRow: {
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  toggle: {
    position: 'absolute',
    right: 14,
  },
  toggleText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.muted,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.ink,
  },
  buttonOutline: {
    backgroundColor: Palette.white,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: HandFonts.bold,
    fontSize: 19,
    color: Palette.white,
  },
  buttonTextOutline: {
    color: Palette.ink,
  },
  note: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
  },
  noteSuccess: {
    borderStyle: 'solid',
    backgroundColor: Palette.ink,
  },
  noteText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },
  noteTextSuccess: {
    color: Palette.white,
  },
});
