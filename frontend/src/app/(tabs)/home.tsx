import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Sparkle } from '@/components/mimo/decorations';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { SparksPill } from '@/components/mimo/sparks-pill';
import { HandFonts, Palette } from '@/constants/theme';
import { bearMood, currentNeed, type Goal, levelFor, type Need, usePet } from '@/state/pet';

/** Sends the user wherever Mimo's current need is met. */
function actOnNeed(need: Need) {
  router.push(need.action === 'rest' ? '/focus' : '/pet');
}

export default function HomeScreen() {
  const { goals, message } = usePet();

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
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} />
          ))}
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  const { name, streakDays, stats } = usePet();

  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <MimoCharacter size={32} mood={bearMood(stats)} />
      </View>
      <View style={styles.headerText}>
        <Text style={styles.petName}>{name}</Text>
        <Text style={styles.streak}>{streakDays}-day phone-free streak</Text>
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
          <MimoCharacter size={120} mood={bearMood(stats)} />
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

function GoalRow({ goal }: { goal: Goal }) {
  const { completeGoal } = usePet();
  const { title, done, reward, focusMinutes } = goal;

  return (
    <View style={styles.goal}>
      <View style={styles.goalTop}>
        <Pressable
          onPress={() => completeGoal(goal.id)}
          disabled={done || !!focusMinutes}
          role="checkbox"
          aria-checked={done}
          accessibilityLabel={`Mark "${title}" complete`}
          hitSlop={8}
          style={[styles.check, done && styles.checkDone]}>
          {done && (
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Path d="M2.5 7.2 L5.7 10 L11.5 4" fill="none" stroke={Palette.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </Pressable>
        <View style={styles.goalText}>
          <Text style={styles.goalTitle}>{title}</Text>
          {!done && <Text style={styles.goalReward}>+{reward} sparks for Mimo</Text>}
        </View>
        {done ? (
          <View style={[styles.status, styles.statusDone]}>
            <Text style={[styles.statusText, styles.statusTextDone]}>Completed ✓</Text>
          </View>
        ) : focusMinutes ? (
          <Pressable onPress={() => router.push('/focus')} style={[styles.status, styles.statusDone]}>
            <Text style={[styles.statusText, styles.statusTextDone]}>Start →</Text>
          </Pressable>
        ) : (
          <View style={styles.status}>
            <Text style={styles.statusText}>Tap ○ when done</Text>
          </View>
        )}
      </View>
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
  goal: {
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: Palette.ink,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    lineHeight: 20,
    color: Palette.ink,
  },
  goalReward: {
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  statusDone: {
    backgroundColor: Palette.ink,
  },
  statusText: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    color: Palette.ink,
  },
  statusTextDone: {
    color: Palette.white,
  },
  message: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
});
