import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceChip } from '@/components/mimo/choice-chip';
import { Sparkle } from '@/components/mimo/decorations';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { HandFonts, Palette } from '@/constants/theme';
import {
  achievabilityTip,
  APP_LABELS,
  type AppGroup,
  DAY_LETTERS,
  describeGoal,
  DURATION_OPTIONS,
  EVERY_DAY,
  frequencyLabel,
  type GoalDraft,
  type GoalKind,
  KIND_LABELS,
  REWARD_OPTIONS,
  TEMPLATES,
  type TimeOfDay,
  WEEKDAYS,
  WEEKENDS,
  WHEN_LABELS,
} from '@/state/goals';
import { usePet } from '@/state/pet';

const DURATION_LABEL: Record<GoalKind, string> = {
  avoid: 'Stay off for',
  limit: 'Daily budget',
  rest: 'Session length',
};

const BLANK: GoalDraft = {
  title: '',
  kind: 'avoid',
  apps: 'social',
  when: 'bed',
  minutes: 30,
  days: EVERY_DAY,
  reward: 20,
  personalReward: '',
  why: '',
};

/** Create or edit a goal. Every part of it is the user's choice. */
export default function GoalEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals, saveGoal, deleteGoal } = usePet();
  const existing = goals.find((g) => g.id === id);

  const [draft, setDraft] = useState<GoalDraft>(() => {
    if (!existing) return BLANK;
    const { streak: _streak, week: _week, ...rest } = existing;
    return rest;
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<GoalDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const tip = achievabilityTip(draft);
  const canSave = draft.title.trim().length > 0 && draft.days.some(Boolean);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/goals'));
  const save = () => {
    saveGoal({ ...draft, title: draft.title.trim(), personalReward: draft.personalReward.trim(), why: draft.why.trim() });
    close();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={close} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>{existing ? 'Edit goal' : 'New goal'}</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Preview draft={draft} />

        {!existing && (
          <Section title="Start from an idea" hint="or build your own below">
            <View style={styles.wrap}>
              {TEMPLATES.map(({ label, ...template }) => (
                <ChoiceChip
                  key={label}
                  label={label}
                  selected={draft.title === template.title}
                  onPress={() => setDraft(template)}
                />
              ))}
            </View>
          </Section>
        )}

        <Section title="Name your goal">
          <TextInput
            value={draft.title}
            onChangeText={(title) => set({ title })}
            placeholder="e.g. No TikTok after 11pm"
            placeholderTextColor={Palette.muted}
            style={styles.input}
            maxLength={48}
          />
        </Section>

        <Section title="What kind of goal?">
          <View style={styles.wrap}>
            {(Object.keys(KIND_LABELS) as GoalKind[]).map((kind) => (
              <ChoiceChip key={kind} label={KIND_LABELS[kind]} selected={draft.kind === kind} onPress={() => set({ kind })} />
            ))}
          </View>
        </Section>

        {draft.kind !== 'rest' && (
          <>
            <Section title="Which apps?">
              <View style={styles.wrap}>
                {(Object.keys(APP_LABELS) as AppGroup[]).map((apps) => (
                  <ChoiceChip key={apps} label={APP_LABELS[apps]} selected={draft.apps === apps} onPress={() => set({ apps })} />
                ))}
              </View>
            </Section>
            <Section title="When?">
              <View style={styles.wrap}>
                {(Object.keys(WHEN_LABELS) as TimeOfDay[]).map((when) => (
                  <ChoiceChip key={when} label={WHEN_LABELS[when]} selected={draft.when === when} onPress={() => set({ when })} />
                ))}
              </View>
            </Section>
          </>
        )}

        <Section title={DURATION_LABEL[draft.kind]}>
          <View style={styles.wrap}>
            {DURATION_OPTIONS.map((minutes) => (
              <ChoiceChip
                key={minutes}
                label={minutes >= 60 ? `${minutes / 60} hr` : `${minutes} min`}
                selected={draft.minutes === minutes}
                onPress={() => set({ minutes })}
              />
            ))}
          </View>
        </Section>

        <Section title="How often?" hint={frequencyLabel(draft.days)}>
          <View style={styles.wrap}>
            <ChoiceChip label="Every day" selected={frequencyLabel(draft.days) === 'Every day'} onPress={() => set({ days: EVERY_DAY })} />
            <ChoiceChip label="Weekdays" selected={frequencyLabel(draft.days) === 'Weekdays'} onPress={() => set({ days: WEEKDAYS })} />
            <ChoiceChip label="Weekends" selected={frequencyLabel(draft.days) === 'Weekends'} onPress={() => set({ days: WEEKENDS })} />
          </View>
          <View style={styles.days}>
            {DAY_LETTERS.map((letter, i) => (
              <ChoiceChip
                key={i}
                round
                label={letter}
                selected={draft.days[i]}
                onPress={() => set({ days: draft.days.map((on, j) => (j === i ? !on : on)) })}
              />
            ))}
          </View>
        </Section>

        <Section title="Your reward" hint="for each day you keep it">
          <View style={styles.wrap}>
            {REWARD_OPTIONS.map((reward) => (
              <ChoiceChip
                key={reward}
                label={`${reward} sparks`}
                selected={draft.reward === reward}
                onPress={() => set({ reward })}
              />
            ))}
          </View>
          <TextInput
            value={draft.personalReward}
            onChangeText={(personalReward) => set({ personalReward })}
            placeholder="Treat yourself to… (optional), e.g. a chapter of my book"
            placeholderTextColor={Palette.muted}
            style={styles.input}
            maxLength={60}
          />
        </Section>

        <Section title="Why it matters to you" hint="optional, Mimo will remind you">
          <TextInput
            value={draft.why}
            onChangeText={(why) => set({ why })}
            placeholder="e.g. I want to fall asleep without scrolling"
            placeholderTextColor={Palette.muted}
            style={[styles.input, styles.multiline]}
            multiline
            maxLength={120}
          />
        </Section>

        {tip && (
          <View style={styles.tip}>
            <MimoCharacter size={36} mood="calm" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        )}

        <Pressable
          onPress={save}
          disabled={!canSave}
          style={({ pressed }) => [styles.save, !canSave && styles.saveDisabled, pressed && styles.pressed]}>
          <Text style={styles.saveText}>{existing ? 'Save changes' : 'Set this goal'}</Text>
        </Pressable>

        {existing && (
          <Pressable
            onPress={() => {
              if (!confirmDelete) return setConfirmDelete(true);
              deleteGoal(existing.id);
              close();
            }}
            hitSlop={8}>
            <Text style={styles.delete}>{confirmDelete ? 'Tap again to delete this goal' : 'Delete goal'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Live summary of the goal as it's being built. */
function Preview({ draft }: { draft: GoalDraft }) {
  return (
    <View style={styles.preview}>
      <View style={styles.previewTop}>
        <View style={styles.previewAvatar}>
          <MimoCharacter size={40} mood="joyful" />
        </View>
        <View style={styles.previewText}>
          <Text style={styles.previewTitle}>{draft.title.trim() || 'Your goal'}</Text>
          <Text style={styles.previewLine}>{describeGoal(draft)}</Text>
        </View>
      </View>
      <View style={styles.previewChips}>
        <View style={styles.previewChip}>
          <Text style={styles.previewChipText}>{frequencyLabel(draft.days)}</Text>
        </View>
        <View style={styles.previewChip}>
          <Sparkle size={10} />
          <Text style={styles.previewChipText}>+{draft.reward} sparks</Text>
        </View>
        {!!draft.personalReward.trim() && (
          <View style={styles.previewChip}>
            <Text style={styles.previewChipText}>+ {draft.personalReward.trim()}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint && <Text style={styles.sectionHint}>{hint}</Text>}
      </View>
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
  cancel: {
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
    width: 50,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 22,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.7,
  },

  preview: {
    gap: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 22,
    lineHeight: 24,
    color: Palette.ink,
  },
  previewLine: {
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.ink,
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  previewChipText: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.ink,
  },

  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  sectionHint: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },

  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
  },
  tipText: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  save: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: Palette.ink,
  },
  saveDisabled: {
    backgroundColor: Palette.muted,
  },
  saveText: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.white,
  },
  delete: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.muted,
  },
});
