import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Sparkle } from '@/components/mimo/decorations';
import { GoalCard } from '@/components/mimo/goal-card';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoPet } from '@/components/mimo/mimo-pet';
import { SparksPill } from '@/components/mimo/sparks-pill';
import { HandFonts, Palette } from '@/constants/theme';
import { useAuth } from '@/state/auth';
import { isScheduledToday } from '@/state/goals';
import { currentNeed, levelFor, type Need, usePet } from '@/state/pet';

/** Sends the user wherever Mimo's current need is met. */
function actOnNeed(need: Need) {
  router.push(need.action === 'rest' ? '/focus' : '/pet');
}

export default function HomeScreen() {
  const { goals, message } = usePet();
  const todaysGoals = goals.filter(isScheduledToday);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header />
        <PetCard />
        <TodayCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Mindful Goals</Text>
          <Link href="/goals" asChild>
            <Pressable hitSlop={8}>
              <Text style={styles.viewAll}>View All →</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.goals}>
          {todaysGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} compact />
          ))}
          {todaysGoals.length === 0 && (
            <Link href="/goal-editor" asChild>
              <Pressable style={styles.addGoal}>
                <Text style={styles.addGoalText}>+ Set a goal for today</Text>
              </Pressable>
            </Link>
          )}
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  const { name, streakDays } = usePet();
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0];

  return (
    <View style={styles.header}>
      <Link href="/account" asChild>
        <Pressable style={styles.avatar} accessibilityLabel="Account" hitSlop={6}>
          <MimoPet size={32} />
        </Pressable>
      </Link>
      <View style={styles.headerText}>
        <Text style={styles.petName} numberOfLines={1}>
          Hi, {firstName}
        </Text>
        <Text style={styles.streak} numberOfLines={1}>
          {name} · {streakDays}-day phone-free streak
        </Text>
      </View>
      <SparksPill />
    </View>
  );
}

function PetCard() {
  const { name, level, stage, stats, xp, nextLevel } = usePet();
  const need = currentNeed(stats);
  const growth = nextLevel ? (xp - levelFor(xp).xp) / (nextLevel.xp - levelFor(xp).xp) : 1;
  const shownStats = [
    { label: 'HAPPINESS', value: stats.mood },
    { label: 'ENERGY', value: stats.energy },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardSparkle}>
        <Sparkle size={18} />
      </View>
      <Link href="/pet" asChild>
        <Pressable style={styles.arrowButton} accessibilityLabel={`Visit ${name}`} hitSlop={8}>
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M6 3 L11 8 L6 13" fill="none" stroke={Palette.white} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </Link>

      {/* Mimo speaks first: its need is the reason to act */}
      <View style={styles.speech}>
        <Text style={styles.speechText}>{need.says}</Text>
        <View style={styles.speechTail} />
      </View>

      <View style={styles.petRing}>
        <View style={styles.petCircle}>
          <MimoPet size={120} />
        </View>
      </View>

      <Pressable onPress={() => actOnNeed(need)} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Text style={styles.ctaText}>{need.cta}</Text>
      </Pressable>

      <View style={styles.growth}>
        <View style={styles.statLabels}>
          <Text style={styles.statLabel}>
            {name} · LEVEL {level} {stage.toUpperCase()}
          </Text>
          <Text style={styles.statLabel}>
            {nextLevel ? `${nextLevel.xp - xp} to ${nextLevel.stage}` : 'fully grown'}
          </Text>
        </View>
        <HatchedProgress value={growth} duration={900} />
      </View>

      <View style={styles.stats}>
        {shownStats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <View style={styles.statLabels}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statLabel}>{stat.value}%</Text>
            </View>
            <HatchedProgress value={stat.value / 100} duration={900} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Today's phone-free minutes against the daily goal: the habit Mimo is built around. */
function TodayCard() {
  const { phoneFreeMinutes, dailyGoalMinutes, name } = usePet();
  const left = Math.max(0, dailyGoalMinutes - phoneFreeMinutes);

  return (
    <View style={styles.today}>
      <View style={styles.statLabels}>
        <Text style={styles.todayTitle}>Phone-free today</Text>
        <Text style={styles.todayValue}>
          {phoneFreeMinutes} / {dailyGoalMinutes} min
        </Text>
      </View>
      <HatchedProgress value={Math.min(1, phoneFreeMinutes / dailyGoalMinutes)} duration={900} />
      <Text style={styles.todayHint}>
        {left > 0
          ? `${left} more minutes keeps your streak and ${name}'s energy up.`
          : `Daily goal reached! ${name} is so proud of you.`}
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
    gap: 18,
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
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  petName: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    lineHeight: 26,
    color: Palette.ink,
  },
  streak: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },

  card: {
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  cardSparkle: {
    position: 'absolute',
    top: 18,
    left: 20,
  },
  arrowButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speech: {
    marginTop: 28,
    maxWidth: 260,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  speechText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    lineHeight: 20,
    textAlign: 'center',
    color: Palette.ink,
  },
  speechTail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: Palette.paper,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: Palette.ink,
    transform: [{ rotate: '45deg' }],
  },
  petRing: {
    padding: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Palette.muted,
    borderStyle: 'dashed',
  },
  petCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: Palette.ink,
  },
  ctaText: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.white,
  },
  growth: {
    alignSelf: 'stretch',
    gap: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
    alignSelf: 'stretch',
  },
  stat: {
    flex: 1,
    gap: 6,
  },
  statLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statLabel: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    color: Palette.ink,
  },

  today: {
    gap: 8,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  todayTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  todayValue: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  todayHint: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
  viewAll: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.muted,
  },
  goals: {
    gap: 12,
  },
  addGoal: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
  },
  addGoalText: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },
  message: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
});
