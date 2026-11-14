import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HandFonts, Palette } from '@/constants/theme';
import {
  DAY_NAMES,
  describeGoal,
  type DayStatus,
  type Goal,
  sortTime,
  timeLabel,
  todayIndex,
  weekDates,
} from '@/state/goals';
import { usePet } from '@/state/pet';

/**
 * Weekly Flow: this week as a calendar strip. Tap a day to see the goals
 * planned for it, in the order they happen.
 */
export function WeeklyFlow() {
  const { goals } = usePet();
  const today = todayIndex();
  const [selected, setSelected] = useState(today);
  const dates = weekDates();

  const planned = goals.filter((g) => g.days[selected]).sort((a, b) => sortTime(a) - sortTime(b));
  const dayTitle = selected === today ? 'Today' : `${DAY_NAMES[selected]} ${dates[selected].getDate()}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Flow</Text>
        <Text style={styles.month}>
          {dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
          {dates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.strip}>
        {dates.map((date, i) => {
          const isSelected = i === selected;
          const hasPlans = goals.some((g) => g.days[i]);
          return (
            <Pressable
              key={i}
              onPress={() => setSelected(i)}
              role="tab"
              aria-selected={isSelected}
              accessibilityLabel={`${DAY_NAMES[i]} ${date.getDate()}${hasPlans ? ', has plans' : ''}`}
              style={({ pressed }) => [
                styles.day,
                i === today && styles.dayToday,
                isSelected && styles.daySelected,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.dayName, isSelected && styles.textOnInk]}>{DAY_NAMES[i]}</Text>
              <Text style={[styles.dayNum, isSelected && styles.textOnInk]}>{date.getDate()}</Text>
              <View style={[styles.dot, !hasPlans && styles.dotHidden, isSelected && styles.dotOnInk]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.dayTitle}>{dayTitle}</Text>

      {planned.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nothing planned. A free day!</Text>
          <Pressable onPress={() => router.push('/goal-editor')} hitSlop={8}>
            <Text style={styles.link}>+ Plan something</Text>
          </Pressable>
        </View>
      ) : (
        planned.map((goal) => (
          <FlowItem key={goal.id} goal={goal} status={selected <= today ? goal.week[selected] : null} />
        ))
      )}
    </View>
  );
}

function FlowItem({ goal, status }: { goal: Goal; status: DayStatus }) {
  const timed = goal.time != null;
  const edit = () => router.push({ pathname: '/goal-editor', params: { id: goal.id } });

  return (
    <Pressable
      onPress={edit}
      accessibilityLabel={`${timeLabel(goal)}: ${goal.title}. Tap to edit.`}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <View style={[styles.timePill, !timed && styles.timePillLoose]}>
        <Text style={[styles.timeText, !timed && styles.timeTextLoose]} numberOfLines={1}>
          {timeLabel(goal)}
        </Text>
      </View>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{goal.title}</Text>
        <Text style={styles.itemLine} numberOfLines={2}>
          {goal.personalReward ? `${describeGoal(goal)} · ${goal.personalReward}` : describeGoal(goal)}
        </Text>
      </View>
      {status && <Text style={styles.status}>{status === 'done' ? '✓' : '–'}</Text>}
    </Pressable>
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
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  month: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  pressed: {
    opacity: 0.7,
  },
  strip: {
    flexDirection: 'row',
    gap: 4,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.shade,
    backgroundColor: Palette.paper,
  },
  dayToday: {
    borderColor: Palette.ink,
  },
  daySelected: {
    borderColor: Palette.ink,
    backgroundColor: Palette.ink,
  },
  dayName: {
    fontFamily: HandFonts.regular,
    fontSize: 13,
    color: Palette.ink,
  },
  dayNum: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },
  textOnInk: {
    color: Palette.white,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.ink,
  },
  dotHidden: {
    opacity: 0,
  },
  dotOnInk: {
    backgroundColor: Palette.white,
  },
  dayTitle: {
    marginTop: 2,
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.muted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  timePill: {
    minWidth: 76,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Palette.ink,
  },
  timePillLoose: {
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
  },
  timeText: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.white,
  },
  timeTextLoose: {
    color: Palette.ink,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    lineHeight: 19,
    color: Palette.ink,
  },
  itemLine: {
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },
  status: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  empty: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  emptyText: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.muted,
  },
  link: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
    textDecorationLine: 'underline',
  },
});
