import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Sparkle } from '@/components/mimo/decorations';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { HandFonts, Palette } from '@/constants/theme';

// Placeholder data until goals and pet stats come from real state.
const PET = { name: 'Mimo', level: 3, stage: 'Sprout', streakDays: 3, sparks: 120 };
const STATS = [
  { label: 'HAPPINESS', value: 0.8 },
  { label: 'ENERGY', value: 0.65 },
];
const GOALS = [
  { id: 'scroll', title: 'Reduce bedtime scrolling by 10m', done: true, progress: 1 },
  { id: 'dinner', title: 'Stay phone-free during dinner', done: false, progress: 0.4 },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header />
        <PetCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Mindful Goals</Text>
          <Link href="/goals" asChild>
            <Pressable hitSlop={8}>
              <Text style={styles.viewAll}>View All →</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.goals}>
          {GOALS.map((goal) => (
            <GoalRow key={goal.id} {...goal} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <MimoCharacter size={32} />
      </View>
      <View style={styles.headerText}>
        <Text style={styles.petName}>{PET.name}</Text>
        <Text style={styles.streak}>mindful streak: {PET.streakDays} days</Text>
      </View>
      <View style={styles.sparksPill}>
        <Sparkle size={12} />
        <Text style={styles.sparksText}>{PET.sparks} sparks</Text>
      </View>
    </View>
  );
}

function PetCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardSparkle}>
        <Sparkle size={18} />
      </View>
      <Link href="/pet" asChild>
        <Pressable style={styles.arrowButton} accessibilityLabel={`Visit ${PET.name}`} hitSlop={8}>
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M6 3 L11 8 L6 13" fill="none" stroke={Palette.white} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </Link>

      <View style={styles.petRing}>
        <View style={styles.petCircle}>
          <MimoCharacter size={130} />
        </View>
      </View>

      <View style={styles.levelPill}>
        <Text style={styles.levelText}>
          {PET.name} · Level {PET.level} {PET.stage}
        </Text>
      </View>

      <View style={styles.stats}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <View style={styles.statLabels}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statLabel}>{Math.round(stat.value * 100)}%</Text>
            </View>
            <HatchedProgress value={stat.value} duration={900} />
          </View>
        ))}
      </View>
    </View>
  );
}

function GoalRow({ title, done, progress }: (typeof GOALS)[number]) {
  return (
    <View style={styles.goal}>
      <View style={styles.goalTop}>
        <View style={[styles.check, done && styles.checkDone]}>
          {done && (
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Path d="M2.5 7.2 L5.7 10 L11.5 4" fill="none" stroke={Palette.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </View>
        <Text style={styles.goalTitle}>{title}</Text>
        <View style={[styles.status, done && styles.statusDone]}>
          <Text style={[styles.statusText, done && styles.statusTextDone]}>
            {done ? 'Completed ✓' : 'In progress'}
          </Text>
        </View>
      </View>
      {!done && (
        <View style={styles.goalProgress}>
          <HatchedProgress value={progress} duration={900} />
        </View>
      )}
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
  sparksPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  sparksText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },

  card: {
    alignItems: 'center',
    gap: 16,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petRing: {
    marginTop: 8,
    padding: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Palette.muted,
    borderStyle: 'dashed',
  },
  petCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  levelText: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
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
  },
  statLabel: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    color: Palette.ink,
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
  goalTitle: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 17,
    lineHeight: 20,
    color: Palette.ink,
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
  goalProgress: {
    paddingLeft: 40,
  },
});
