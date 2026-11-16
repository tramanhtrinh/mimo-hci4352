import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoPet } from '@/components/mimo/mimo-pet';
import { SparksPill } from '@/components/mimo/sparks-pill';
import { HandFonts, Palette } from '@/constants/theme';
import { APP_LABELS, DAY_LETTERS, todayIndex } from '@/state/goals';
import { LEVELS, levelFor, usePet } from '@/state/pet';
import {
  CATEGORY_SHORT,
  formatMinutes,
  categoryTotal,
  PEAK_USAGE,
  spokenMinutes,
  suggestedGoal,
  topApps,
  USAGE_CATEGORIES,
  weekTotal,
} from '@/state/usage';

// Chart geometry: total height minus top padding, value labels and day labels.
const CHART_HEIGHT = 160;
const LABEL_HEIGHT = 22;
const TRACK_HEIGHT = CHART_HEIGHT - 16 - 16 - LABEL_HEIGHT;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


/** Reflection on phone-free time: this week, overall, Mimo's growth and milestones. */
export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <SparksPill />
        </View>
        <WeekChart />
        <PhoneUseCard />
        <StatTiles />
        <GrowthPath />
        <Milestones />
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekChart() {
  const { phoneFreeByDay, dailyGoalMinutes, name } = usePet();
  const today = todayIndex();
  const max = Math.max(dailyGoalMinutes, ...phoneFreeByDay, 1);
  const total = phoneFreeByDay.reduce((a, b) => a + b, 0);
  const best = phoneFreeByDay.indexOf(Math.max(...phoneFreeByDay));
  const daysMet = phoneFreeByDay.filter((m) => m >= dailyGoalMinutes).length;
  const goalLine = LABEL_HEIGHT + (dailyGoalMinutes / max) * TRACK_HEIGHT;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>This week</Text>
        <Text style={styles.cardValue}>{formatMinutes(total)} phone-free</Text>
      </View>

      <View style={styles.chart}>
        <View style={[styles.goalLine, { bottom: goalLine }]}>
          <Text style={styles.goalLineLabel}>goal {dailyGoalMinutes}m</Text>
        </View>
        {phoneFreeByDay.map((m, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <Text style={styles.barValue}>{m > 0 ? m : ''}</Text>
              <View
                style={[
                  styles.bar,
                  { height: (m / max) * TRACK_HEIGHT },
                  i === today && styles.barToday,
                  i > today && styles.barFuture,
                ]}
              />
            </View>
            <Text style={[styles.barLabel, i === today && styles.barLabelToday]}>{DAY_LETTERS[i]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.insight}>
        <MimoPet size={40} />
        <Text style={styles.insightText}>
          {total === 0
            ? `No phone-free time yet this week. Want to rest with ${name}?`
            : `Your best day was ${DAY_NAMES[best]} (${phoneFreeByDay[best]} min). ${
                daysMet > 0
                  ? `You hit your ${dailyGoalMinutes}-minute goal ${daysMet === 1 ? 'once' : `${daysMet} times`}!`
                  : `Only ${dailyGoalMinutes - phoneFreeByDay[best]} more minutes on a day like that hits your goal.`
              }`}
        </Text>
      </View>
    </View>
  );
}

/** This week's (pretend) screen time: where it goes, the top apps, and a nudge to set a goal for the biggest habit. */
function PhoneUseCard() {
  const total = weekTotal();
  const top = topApps(3);
  const goal = suggestedGoal();

  const makeGoal = () =>
    router.push({
      pathname: '/goal-editor',
      params: { ...goal, appNames: goal.appNames.join(','), minutes: String(goal.minutes) },
    });

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>Your phone use</Text>
        <Text style={styles.cardValue} accessibilityLabel={`${spokenMinutes(total)} on your phone this week`}>
          {formatMinutes(total)} this week
        </Text>
      </View>

      {USAGE_CATEGORIES.map((c) => {
        const minutes = categoryTotal(c);
        return (
          <View
            key={c}
            style={styles.usageRow}
            accessible
            accessibilityLabel={`${APP_LABELS[c]}, ${spokenMinutes(minutes)} this week`}>
            <Text style={styles.usageLabel}>
              {CATEGORY_SHORT[c]} · {formatMinutes(minutes)}
            </Text>
            <HatchedProgress value={minutes / total} duration={900} />
          </View>
        );
      })}

      <Text style={styles.subTitle}>Top apps</Text>
      {top.map((app, i) => (
        <View
          key={app.name}
          style={styles.topApp}
          accessible
          accessibilityLabel={`Number ${i + 1}, ${app.name}, ${spokenMinutes(app.minutes)} this week`}>
          <Text style={styles.topAppName}>
            {i + 1}. {app.name}
          </Text>
          <Text style={styles.cardValue}>{formatMinutes(app.minutes)}</Text>
        </View>
      ))}

      <View style={styles.insight}>
        <MimoPet size={40} />
        <Text
          style={styles.insightText}
          accessibilityLabel={`You use your phone most around ${PEAK_USAGE.spoken}, mostly ${top[0].name}.`}>
          You use your phone most around {PEAK_USAGE.label}, mostly {top[0].name}.
        </Text>
      </View>

      <Pressable
        onPress={makeGoal}
        accessibilityRole="button"
        accessibilityHint={`Starts a new goal: ${goal.title}`}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Text style={styles.ctaText}>Make a goal for this</Text>
      </Pressable>
    </View>
  );
}

function StatTiles() {
  const { totalPhoneFreeMinutes, sessions, streakDays, goals } = usePet();
  const today = todayIndex();
  let kept = 0;
  let scheduled = 0;
  for (const g of goals) {
    g.days.forEach((on, i) => {
      if (!on || i > today || (i === today && !g.week[i])) return;
      scheduled += 1;
      if (g.week[i] === 'done') kept += 1;
    });
  }

  const tiles = [
    { value: formatMinutes(totalPhoneFreeMinutes), label: 'phone-free all time' },
    { value: `${sessions}`, label: 'sessions with Mimo' },
    { value: `${kept}/${scheduled}`, label: 'goals kept this week' },
    { value: `${streakDays}`, label: 'day streak' },
  ];

  return (
    <View style={styles.tiles}>
      {tiles.map((t) => (
        <View key={t.label} style={styles.tile}>
          <Text style={styles.tileValue}>{t.value}</Text>
          <Text style={styles.tileLabel}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
}

function GrowthPath() {
  const { xp, level, name, nextLevel } = usePet();
  const current = levelFor(xp);
  const progress = nextLevel ? (xp - current.xp) / (nextLevel.xp - current.xp) : 1;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{name}&apos;s growth</Text>
      <View style={styles.path}>
        {/* one track behind all the dots: dashed ahead, solid for stages already reached */}
        <View style={styles.track} />
        <View style={[styles.trackDone, { width: `${((level - 1) / (LEVELS.length - 1)) * 80}%` }]} />
        {LEVELS.map((l) => {
          const reached = l.level <= level;
          return (
            <View key={l.level} style={styles.stageCol}>
              <View style={[styles.stageDot, reached && styles.stageDotOn, l.level === level && styles.stageDotNow]}>
                <Text style={[styles.stageNum, reached && styles.stageNumOn]}>{l.level}</Text>
              </View>
              <Text style={[styles.stageName, l.level === level && styles.stageNameNow]}>{l.stage}</Text>
            </View>
          );
        })}
      </View>
      <HatchedProgress value={progress} duration={900} />
      <Text style={styles.hint}>
        {nextLevel
          ? `${nextLevel.xp - xp} growth to ${nextLevel.stage}. Each phone-free minute adds 2.`
          : `${name} is fully grown!`}
      </Text>
    </View>
  );
}

function Milestones() {
  const { sessions, phoneFreeByDay, dailyGoalMinutes, streakDays, totalPhoneFreeMinutes, level, owned, name } =
    usePet();
  const bestDay = Math.max(...phoneFreeByDay);

  const milestones = [
    { title: 'First rest together', done: sessions >= 1, detail: 'Finish a phone-free session' },
    {
      title: 'Daily goal reached',
      done: bestDay >= dailyGoalMinutes,
      detail: `${Math.min(bestDay, dailyGoalMinutes)} / ${dailyGoalMinutes} min in one day`,
    },
    { title: '3-day streak', done: streakDays >= 3, detail: `${Math.min(streakDays, 3)} / 3 days` },
    {
      title: '5 hours phone-free',
      done: totalPhoneFreeMinutes >= 300,
      detail: `${formatMinutes(Math.min(totalPhoneFreeMinutes, 300))} / 5h`,
    },
    { title: `${name} blooms`, done: level >= 4, detail: 'Reach Level 4' },
    { title: 'Dress-up day', done: owned.length > 0, detail: 'Buy something in Rewards' },
  ];
  const earned = milestones.filter((m) => m.done).length;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>Milestones</Text>
        <Text style={styles.cardValue}>
          {earned} / {milestones.length}
        </Text>
      </View>
      {milestones.map((m) => (
        <View key={m.title} style={styles.milestone}>
          <View style={[styles.badge, m.done && styles.badgeDone]}>
            <Text style={[styles.badgeMark, m.done && styles.badgeMarkDone]}>{m.done ? '✓' : ''}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={[styles.milestoneTitle, !m.done && styles.muted]}>{m.title}</Text>
            {!m.done && <Text style={styles.milestoneDetail}>{m.detail}</Text>}
          </View>
        </View>
      ))}
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
    gap: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  muted: {
    color: Palette.muted,
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
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 22,
    color: Palette.ink,
  },
  cardValue: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  hint: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },

  chart: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderColor: Palette.muted,
    borderStyle: 'dashed',
  },
  goalLineLabel: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontFamily: HandFonts.bold,
    fontSize: 12,
    color: Palette.muted,
  },
  barCol: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
  },
  barValue: {
    height: 16,
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 12,
    color: Palette.ink,
  },
  barTrack: {
    flex: 1,
    width: 26,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 22,
    minHeight: 2,
    borderRadius: 8,
    backgroundColor: Palette.ink,
  },
  barToday: {
    backgroundColor: Palette.shade,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  barFuture: {
    backgroundColor: Palette.shade,
  },
  barLabel: {
    height: LABEL_HEIGHT,
    paddingTop: 4,
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },
  barLabelToday: {
    fontFamily: HandFonts.bold,
    color: Palette.ink,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: Palette.paper,
  },
  insightText: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },

  usageRow: {
    gap: 4,
  },
  usageLabel: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  subTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },
  topApp: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  topAppName: {
    fontFamily: HandFonts.regular,
    fontSize: 17,
    color: Palette.ink,
  },
  cta: {
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

  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '40%',
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  tileValue: {
    fontFamily: HandFonts.bold,
    fontSize: 26,
    color: Palette.ink,
  },
  tileLabel: {
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },

  path: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  // each of the 5 columns is 20% wide, so dot centres run from 10% to 90%
  track: {
    position: 'absolute',
    top: 16,
    left: '10%',
    right: '10%',
    borderTopWidth: 2,
    borderColor: Palette.shade,
    borderStyle: 'dashed',
  },
  trackDone: {
    position: 'absolute',
    top: 16,
    left: '10%',
    borderTopWidth: 2,
    borderColor: Palette.ink,
  },
  stageDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: Palette.shade,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotOn: {
    borderColor: Palette.ink,
    backgroundColor: Palette.ink,
  },
  stageDotNow: {
    boxShadow: `0px 0px 0px 4px ${Palette.shade}`,
  },
  stageNum: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.muted,
  },
  stageNumOn: {
    color: Palette.white,
  },
  stageName: {
    fontFamily: HandFonts.regular,
    fontSize: 13,
    color: Palette.muted,
  },
  stageNameNow: {
    fontFamily: HandFonts.bold,
    color: Palette.ink,
  },

  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Palette.muted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: {
    borderStyle: 'solid',
    borderColor: Palette.ink,
    backgroundColor: Palette.ink,
  },
  badgeMark: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },
  badgeMarkDone: {
    color: Palette.white,
  },
  milestoneTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  milestoneDetail: {
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },
});
