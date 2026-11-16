import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalCard } from '@/components/mimo/goal-card';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { HighlightTitle } from '@/components/mimo/highlight-title';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { SparksPill } from '@/components/mimo/sparks-pill';
import { WeeklyFlow } from '@/components/mimo/weekly-flow';
import { HandFonts, Palette, Pastel } from '@/constants/theme';
import { isScheduledToday, todayIndex } from '@/state/goals';
import { usePet } from '@/state/pet';

export default function GoalsScreen() {
  const { goals, message } = usePet();
  const today = goals.filter(isScheduledToday);
  const restDay = goals.filter((g) => !isScheduledToday(g));
  const newGoal = () => router.push('/goal-editor');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
          <SparksPill />
        </View>

        <WeekSummary />

        <WeeklyFlow />

        <Pressable onPress={newGoal} style={({ pressed }) => [styles.newGoal, pressed && styles.pressed]}>
          <Text style={styles.newGoalText}>+ Create a goal</Text>
        </Pressable>

        {message && <Text style={styles.message}>{message}</Text>}

        {goals.length === 0 && (
          <View style={styles.empty}>
            <MimoCharacter size={90} mood="calm" />
            <Text style={styles.emptyText}>No goals yet. What would feel good to change?</Text>
          </View>
        )}

        {today.length > 0 && <HighlightTitle>Today</HighlightTitle>}
        {today.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}

        {restDay.length > 0 && <Text style={styles.sectionTitle}>Not today</Text>}
        {restDay.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/** How many scheduled days so far this week were kept: accountability without judgement. */
function WeekSummary() {
  const { goals } = usePet();
  const today = todayIndex();
  let scheduled = 0;
  let kept = 0;
  for (const g of goals) {
    g.days.forEach((on, i) => {
      if (!on || i > today) return;
      // today only counts once it's been checked in
      if (i === today && !g.week[i]) return;
      scheduled += 1;
      if (g.week[i] === 'done') kept += 1;
    });
  }

  return (
    <View style={styles.summary}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryTitle}>This week</Text>
        <Text style={styles.summaryValue}>
          {kept} / {scheduled} kept
        </Text>
      </View>
      <HatchedProgress value={scheduled ? kept / scheduled : 0} duration={900} color={Pastel.butter} />
      <Text style={styles.summaryHint}>
        You set these goals, so you decide what&apos;s realistic. Missed one? Make it easier and keep going.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 14,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 34,
    color: Palette.ink,
  },
  summary: {
    gap: 8,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summaryTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  summaryValue: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  summaryHint: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  newGoal: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: Palette.ink,
  },
  newGoalText: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.white,
  },
  message: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  sectionTitle: {
    marginTop: 8,
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.muted,
  },
});
