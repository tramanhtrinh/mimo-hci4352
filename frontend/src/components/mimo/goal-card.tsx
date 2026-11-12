import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HandFonts, Palette } from '@/constants/theme';
import {
  DAY_LETTERS,
  describeGoal,
  frequencyLabel,
  type Goal,
  isScheduledToday,
  todayIndex,
  todayStatus,
} from '@/state/goals';
import { usePet } from '@/state/pet';

type Props = {
  goal: Goal;
  /** Smaller version for Home: no week history or personal reason. */
  compact?: boolean;
};

/** A user's goal with its schedule, streak and today's honest check-in. */
export function GoalCard({ goal, compact }: Props) {
  const scheduled = isScheduledToday(goal);
  const status = todayStatus(goal);
  const edit = () => router.push({ pathname: '/goal-editor', params: { id: goal.id } });

  return (
    <View style={[styles.card, status === 'done' && styles.cardDone]}>
      <View style={styles.top}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.line}>{describeGoal(goal)}</Text>
        </View>
        <Pressable onPress={edit} hitSlop={8} accessibilityLabel={`Edit ${goal.title}`} style={styles.editButton}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Tag label={frequencyLabel(goal.days)} />
        <Tag label={`+${goal.reward} sparks`} />
        {!!goal.personalReward && <Tag label={`+ ${goal.personalReward}`} />}
        {goal.streak > 0 && <Tag label={`${goal.streak}-day streak`} ink />}
      </View>

      {!compact && !!goal.why && <Text style={styles.why}>“{goal.why}”</Text>}
      {!compact && <WeekDots goal={goal} />}

      {scheduled ? <CheckIn goal={goal} /> : <Text style={styles.restDay}>Rest day: not scheduled today</Text>}
    </View>
  );
}

function CheckIn({ goal }: { goal: Goal }) {
  const { checkIn } = usePet();
  const status = todayStatus(goal);

  if (status === 'done') {
    return (
      <View style={styles.keptRow}>
        <View style={styles.keptPill}>
          <Text style={styles.keptText}>Kept today ✓</Text>
        </View>
      </View>
    );
  }

  if (status === 'skipped') {
    return (
      <View style={styles.actions}>
        <Text style={styles.skippedText}>Not today, and that&apos;s okay.</Text>
        <Pressable onPress={() => checkIn(goal.id, 'done')} hitSlop={8}>
          <Text style={styles.linkText}>I did it after all</Text>
        </Pressable>
      </View>
    );
  }

  if (goal.kind === 'rest') {
    return (
      <Pressable onPress={() => router.push('/focus')} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>Start a {goal.minutes} min session →</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.actions}>
      <Pressable
        onPress={() => checkIn(goal.id, 'done')}
        style={({ pressed }) => [styles.primary, styles.flex, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>I did it ✓</Text>
      </Pressable>
      <Pressable
        onPress={() => checkIn(goal.id, 'skipped')}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <Text style={styles.secondaryText}>Not today</Text>
      </Pressable>
    </View>
  );
}

/** This week at a glance: kept, missed, upcoming and rest days. */
function WeekDots({ goal }: { goal: Goal }) {
  const today = todayIndex();
  return (
    <View style={styles.week}>
      {DAY_LETTERS.map((letter, i) => {
        const status = goal.week[i];
        const on = goal.days[i];
        return (
          <View key={i} style={styles.dayCol}>
            <View
              style={[
                styles.dot,
                !on && styles.dotOff,
                status === 'done' && styles.dotDone,
                status === 'skipped' && styles.dotSkipped,
                i === today && styles.dotToday,
              ]}>
              <Text style={[styles.dotMark, status === 'done' && styles.dotMarkDone]}>
                {status === 'done' ? '✓' : status === 'skipped' ? '–' : ''}
              </Text>
            </View>
            <Text style={[styles.dayLetter, i === today && styles.dayLetterToday]}>{letter}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Tag({ label, ink }: { label: string; ink?: boolean }) {
  return (
    <View style={[styles.tag, ink && styles.tagInk]}>
      <Text style={[styles.tagText, ink && styles.tagTextInk]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  cardDone: {
    backgroundColor: Palette.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    lineHeight: 22,
    color: Palette.ink,
  },
  line: {
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.ink,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.muted,
  },
  editText: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.muted,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  tagInk: {
    backgroundColor: Palette.ink,
  },
  tagText: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    color: Palette.ink,
  },
  tagTextInk: {
    color: Palette.white,
  },
  why: {
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.muted,
  },

  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOff: {
    borderColor: Palette.shade,
  },
  dotDone: {
    backgroundColor: Palette.ink,
  },
  dotSkipped: {
    borderStyle: 'dashed',
    borderColor: Palette.muted,
  },
  dotToday: {
    borderWidth: 3,
  },
  dotMark: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.muted,
  },
  dotMarkDone: {
    color: Palette.white,
  },
  dayLetter: {
    fontFamily: HandFonts.regular,
    fontSize: 13,
    color: Palette.muted,
  },
  dayLetterToday: {
    fontFamily: HandFonts.bold,
    color: Palette.ink,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  primary: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Palette.ink,
  },
  primaryText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.white,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  secondaryText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  pressed: {
    opacity: 0.7,
  },
  keptRow: {
    flexDirection: 'row',
  },
  keptPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Palette.ink,
  },
  keptText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.white,
  },
  skippedText: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.muted,
  },
  linkText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
    textDecorationLine: 'underline',
  },
  restDay: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
});
