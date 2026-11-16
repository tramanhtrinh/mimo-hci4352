import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HighlightTitle } from '@/components/mimo/highlight-title';
import { HandFonts, Palette, Pastel } from '@/constants/theme';
import {
  DAY_LETTERS,
  describeGoal,
  formatTime,
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
    <View
      style={[
        styles.card,
        // Not scheduled today sinks into the page, so today's goals stand out.
        { backgroundColor: scheduled ? Palette.white : Palette.paper },
      ]}>
      <View style={styles.top}>
        <View style={styles.titleBlock}>
          {/* A kept goal gets the sparks-yellow highlighter, like ticking it off a list. */}
          <HighlightTitle on={status === 'done'} header={false} textStyle={styles.title}>
            {goal.title}
          </HighlightTitle>
          <Text style={styles.line}>{describeGoal(goal)}</Text>
        </View>
        <Pressable onPress={edit} hitSlop={8} accessibilityLabel={`Edit ${goal.title}`} style={styles.editButton}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Tag label={frequencyLabel(goal.days)} />
        {goal.time != null && <Tag label={formatTime(goal.time)} />}
        <Tag label={`+${goal.reward} sparks`} sparks />
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
  const { checkIn, undoCheckIn } = usePet();
  const status = todayStatus(goal);

  if (status === 'done') {
    return (
      <View style={styles.keptRow}>
        <View style={styles.keptPill}>
          <Text style={styles.keptText}>Kept today ✓</Text>
        </View>
        {/* Rest goals are checked in by a finished focus session, so there's nothing to take back by hand. */}
        {goal.kind !== 'rest' && (
          <Pressable
            onPress={() => undoCheckIn(goal.id)}
            accessibilityRole="button"
            accessibilityLabel={`Undo check-in for ${goal.title}`}
            hitSlop={8}>
            <Text style={styles.linkText}>Undo</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (status === 'skipped') {
    return (
      <View style={styles.actions}>
        <Text style={styles.skippedText}>Not today, and that&apos;s okay.</Text>
        <Pressable onPress={() => checkIn(goal.id, 'done')} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.linkText}>I did it after all</Text>
        </Pressable>
      </View>
    );
  }

  if (goal.kind === 'rest') {
    return (
      <Pressable
        onPress={() => router.push('/focus')}
        accessibilityRole="button"
        accessibilityLabel={`Start a ${goal.minutes} minute session`}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>Start a {goal.minutes} min session →</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.actions}>
      <Pressable
        onPress={() => checkIn(goal.id, 'done')}
        accessibilityRole="button"
        accessibilityLabel="I did it"
        style={({ pressed }) => [styles.primary, styles.flex, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>I did it ✓</Text>
      </Pressable>
      <Pressable
        onPress={() => checkIn(goal.id, 'skipped')}
        accessibilityRole="button"
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

function Tag({ label, ink, sparks }: { label: string; ink?: boolean; sparks?: boolean }) {
  return (
    <View style={[styles.tag, sparks && styles.tagSparks, ink && styles.tagInk]}>
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
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  editText: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.ink,
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
    backgroundColor: Palette.white,
  },
  tagSparks: {
    backgroundColor: Pastel.butter,
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
    color: Palette.ink,
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
    borderColor: Palette.ink,
    opacity: 0.25,
  },
  dotDone: {
    backgroundColor: Palette.ink,
  },
  dotSkipped: {
    borderStyle: 'dashed',
    backgroundColor: Palette.white,
  },
  dotToday: {
    borderWidth: 3,
  },
  dotMark: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.ink,
  },
  dotMarkDone: {
    color: Palette.white,
  },
  dayLetter: {
    fontFamily: HandFonts.regular,
    fontSize: 13,
    color: Palette.ink,
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
    backgroundColor: Palette.white,
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
    alignItems: 'center',
    gap: 14,
  },
  keptPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Pastel.butter,
  },
  keptText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },
  skippedText: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
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
    color: Palette.ink,
  },
});
