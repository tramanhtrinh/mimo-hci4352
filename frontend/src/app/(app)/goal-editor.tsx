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
  APPS_BY_GROUP,
  DAY_LETTERS,
  describeGoal,
  DURATION_OPTIONS,
  EVERY_DAY,
  formatTime,
  frequencyLabel,
  type GoalDraft,
  type GoalKind,
  KIND_LABELS,
  REWARD_OPTIONS,
  SUGGESTED_TIME,
  TEMPLATES,
  TIME_STEP,
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
  time: null,
  reward: 20,
  personalReward: '',
  why: '',
};

type PrefillParams = Partial<Record<'title' | 'kind' | 'apps' | 'appNames' | 'when' | 'minutes', string | string[]>>;

const firstParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const isKey = <T extends string>(labels: Record<T, string>, v: string | undefined): v is T =>
  v != null && Object.prototype.hasOwnProperty.call(labels, v);

/**
 * A new goal can start pre-filled from route params, e.g. from the Progress tab's
 * "Make a goal for this". Anything missing or invalid falls back to the blank goal.
 */
function draftFromParams(params: PrefillParams): GoalDraft {
  const draft: GoalDraft = { ...BLANK };
  const title = firstParam(params.title)?.trim();
  if (title) draft.title = title.slice(0, 48);
  const kind = firstParam(params.kind);
  if (isKey(KIND_LABELS, kind)) draft.kind = kind;
  const apps = firstParam(params.apps);
  if (isKey(APP_LABELS, apps)) draft.apps = apps;
  const names = (firstParam(params.appNames) ?? '').split(',').map((n) => n.trim());
  const valid = APPS_BY_GROUP[draft.apps].filter((n) => names.includes(n));
  if (valid.length) draft.appNames = [...new Set(names.filter((n) => valid.includes(n)))];
  const when = firstParam(params.when);
  if (isKey(WHEN_LABELS, when)) draft.when = when;
  const minutes = Number(firstParam(params.minutes));
  if (DURATION_OPTIONS.includes(minutes)) draft.minutes = minutes;
  return draft;
}

/** Create or edit a goal. Every part of it is the user's choice. */
export default function GoalEditorScreen() {
  const { id, ...prefill } = useLocalSearchParams<PrefillParams & { id?: string }>();
  const { goals, saveGoal, deleteGoal } = usePet();
  const existing = goals.find((g) => g.id === id);

  const [initial] = useState<GoalDraft>(() => {
    if (!id) return draftFromParams(prefill);
    if (!existing) return BLANK;
    const { streak: _streak, week: _week, ...rest } = existing;
    return rest;
  });
  const [draft, setDraftState] = useState<GoalDraft>(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  /** Any change hides the "discard changes?" prompt, since the user is clearly still editing. */
  const setDraft = (next: GoalDraft | ((d: GoalDraft) => GoalDraft)) => {
    setConfirmDiscard(false);
    setDraftState(next);
  };
  const set = (patch: Partial<GoalDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const pickedApps = draft.appNames ?? [];
  const toggleApp = (name: string) =>
    set({ appNames: pickedApps.includes(name) ? pickedApps.filter((n) => n !== name) : [...pickedApps, name] });

  const tip = achievabilityTip(draft);
  const hasName = draft.title.trim().length > 0;
  const canSave = hasName && draft.days.some(Boolean);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/goals'));
  /** Leaving with unsaved changes asks first, so a stray tap doesn't throw away a half-built goal. */
  const cancel = () => (dirty ? setConfirmDiscard(true) : close());
  const save = () => {
    saveGoal({ ...draft, title: draft.title.trim(), personalReward: draft.personalReward.trim(), why: draft.why.trim() });
    close();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={cancel} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>{existing ? 'Edit goal' : 'New goal'}</Text>
        <View style={styles.topSpacer} />
      </View>

      {confirmDiscard && (
        <View style={styles.discard} accessibilityRole="alert">
          <Text style={styles.discardText}>Discard your changes to this goal?</Text>
          <View style={styles.discardActions}>
            <Pressable
              onPress={() => setConfirmDiscard(false)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.discardKeep, pressed && styles.pressed]}>
              <Text style={styles.discardKeepText}>Keep editing</Text>
            </Pressable>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              style={({ pressed }) => [styles.discardLeave, pressed && styles.pressed]}>
              <Text style={styles.discardLeaveText}>Discard</Text>
            </Pressable>
          </View>
        </View>
      )}

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
            accessibilityLabel="Name your goal"
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
            <Section title="Which apps?" hint={draft.apps !== 'all' ? 'optional, pick specific apps' : undefined}>
              <View style={styles.wrap}>
                {(Object.keys(APP_LABELS) as AppGroup[]).map((apps) => (
                  <ChoiceChip
                    key={apps}
                    label={APP_LABELS[apps]}
                    selected={draft.apps === apps}
                    onPress={() => draft.apps !== apps && set({ apps, appNames: [] })}
                  />
                ))}
              </View>
              {draft.apps !== 'all' && (
                <View style={styles.wrap}>
                  {APPS_BY_GROUP[draft.apps].map((name) => (
                    <ChoiceChip key={name} label={name} selected={pickedApps.includes(name)} onPress={() => toggleApp(name)} />
                  ))}
                </View>
              )}
            </Section>
            <Section title="When?">
              <View style={styles.wrap}>
                {(Object.keys(WHEN_LABELS) as TimeOfDay[]).map((when) => (
                  <ChoiceChip
                    key={when}
                    label={WHEN_LABELS[when]}
                    selected={draft.when === when}
                    // A picked clock time follows the new time of day, so "Before bed" never shows 7:30 AM.
                    onPress={() => set(draft.time != null ? { when, time: SUGGESTED_TIME[when] } : { when })}
                  />
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

        <Section title="What time?" hint="optional, shows on your Weekly Flow">
          <View style={styles.wrap}>
            <ChoiceChip label="No set time" selected={draft.time == null} onPress={() => set({ time: null })} />
            <ChoiceChip
              label="Pick a time"
              selected={draft.time != null}
              onPress={() => draft.time == null && set({ time: SUGGESTED_TIME[draft.when] })}
            />
          </View>
          {draft.time != null && (
            <View style={styles.timeRow}>
              <Pressable
                onPress={() => set({ time: ((draft.time ?? 0) - TIME_STEP + 24 * 60) % (24 * 60) })}
                accessibilityLabel={`${TIME_STEP} minutes earlier`}
                hitSlop={8}
                style={({ pressed }) => [styles.timeStep, pressed && styles.pressed]}>
                <Text style={styles.timeStepText}>−</Text>
              </Pressable>
              <Text style={styles.timeValue}>{formatTime(draft.time)}</Text>
              <Pressable
                onPress={() => set({ time: ((draft.time ?? 0) + TIME_STEP) % (24 * 60) })}
                accessibilityLabel={`${TIME_STEP} minutes later`}
                hitSlop={8}
                style={({ pressed }) => [styles.timeStep, pressed && styles.pressed]}>
                <Text style={styles.timeStepText}>+</Text>
              </Pressable>
            </View>
          )}
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
            accessibilityLabel="Your reward: treat yourself to"
            accessibilityHint="Optional. Something you promise yourself for each day you keep it."
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
            accessibilityLabel="Why it matters to you"
            accessibilityHint="Optional. Mimo will remind you."
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

        {!hasName && <Text style={styles.saveHint}>Give your goal a name (at the top) to save it.</Text>}

        <Pressable
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          style={({ pressed }) => [styles.save, !canSave && styles.saveDisabled, pressed && styles.pressed]}>
          <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>{existing ? 'Save changes' : 'Set this goal'}</Text>
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
        {draft.time != null && (
          <View style={styles.previewChip}>
            <Text style={styles.previewChipText}>{formatTime(draft.time)}</Text>
          </View>
        )}
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  timeStep: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeStepText: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
  timeValue: {
    minWidth: 120,
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 28,
    color: Palette.ink,
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
    backgroundColor: Palette.shade,
  },
  saveText: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.white,
  },
  saveTextDisabled: {
    color: Palette.muted,
  },
  saveHint: {
    marginBottom: -12,
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  discard: {
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 6,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  discardText: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },
  discardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  discardKeep: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Palette.ink,
  },
  discardKeepText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.white,
  },
  discardLeave: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  discardLeaveText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  delete: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.muted,
  },
});
