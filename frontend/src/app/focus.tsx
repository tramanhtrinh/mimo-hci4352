import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/mimo/decorations';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { HandFonts, Palette } from '@/constants/theme';
import { focusReward, levelFor, SPARKS_PER_MINUTE, usePet } from '@/state/pet';

const DURATIONS = [5, 15, 30];

type Summary = {
  minutes: number;
  early: boolean;
  peeks: number;
  sparks: number;
  energy: number;
  mood: number;
  xp: number;
  goalsDone: string[];
  grewInto: string | null;
};

/**
 * Phone-free session: the user puts the phone down and Mimo naps.
 * Leaving the app mid-session counts as a "peek" and gently trims the reward.
 */
export default function FocusScreen() {
  const [phase, setPhase] = useState<'setup' | 'running' | 'done'>('setup');
  const [minutes, setMinutes] = useState(15);
  // In demo speed one minute passes in one second, so a session fits in a presentation.
  const [demoSpeed, setDemoSpeed] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);

  return (
    <View style={[styles.screen, phase === 'running' && styles.screenNight]}>
      {phase === 'setup' && (
        <Setup
          minutes={minutes}
          onMinutes={setMinutes}
          demoSpeed={demoSpeed}
          onDemoSpeed={setDemoSpeed}
          onStart={() => setPhase('running')}
        />
      )}
      {phase === 'running' && (
        <Running
          minutes={minutes}
          msPerMinute={demoSpeed ? 1000 : 60_000}
          onFinish={(s) => {
            setSummary(s);
            setPhase('done');
          }}
        />
      )}
      {phase === 'done' && summary && <Done summary={summary} />}
    </View>
  );
}

function Setup({
  minutes,
  onMinutes,
  demoSpeed,
  onDemoSpeed,
  onStart,
}: {
  minutes: number;
  onMinutes: (m: number) => void;
  demoSpeed: boolean;
  onDemoSpeed: (on: boolean) => void;
  onStart: () => void;
}) {
  const { name } = usePet();
  const reward = focusReward(minutes, 0, false);

  return (
    <SafeAreaView style={styles.setup}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        hitSlop={12}
        style={styles.close}>
        <Text style={styles.closeText}>not now</Text>
      </Pressable>

      <MimoCharacter size={150} mood="sleepy" />
      <Text style={styles.title}>Phone-free time</Text>
      <Text style={styles.body}>
        Put your phone face-down and {name} will nap beside you. You&apos;ll earn {SPARKS_PER_MINUTE} sparks for
        every minute away.
      </Text>

      <View style={styles.chips}>
        {DURATIONS.map((m) => (
          <Pressable
            key={m}
            onPress={() => onMinutes(m)}
            role="radio"
            aria-checked={m === minutes}
            style={[styles.chip, m === minutes && styles.chipActive]}>
            <Text style={[styles.chipText, m === minutes && styles.chipTextActive]}>{m} min</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.rewardCard}>
        <Text style={styles.rewardHeading}>{name} will get</Text>
        <View style={styles.rewardRow}>
          <RewardChip label={`+${reward.sparks} sparks`} />
          <RewardChip label={`+${reward.effect.energy} energy`} />
          <RewardChip label={`+${reward.xp} growth`} />
        </View>
      </View>

      <Pressable
        onPress={() => onDemoSpeed(!demoSpeed)}
        role="switch"
        aria-checked={demoSpeed}
        hitSlop={8}
        style={styles.demoRow}>
        <View style={[styles.toggle, demoSpeed && styles.toggleOn]}>
          <View style={[styles.toggleKnob, demoSpeed && styles.toggleKnobOn]} />
        </View>
        <Text style={styles.demoText}>Demo speed (1 min = 1 sec)</Text>
      </Pressable>

      <Pressable onPress={onStart} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>Put phone down · {minutes} min</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Running({
  minutes,
  msPerMinute,
  onFinish,
}: {
  minutes: number;
  msPerMinute: number;
  onFinish: (summary: Summary) => void;
}) {
  const { name, setFocusing, finishFocus, goals, xp } = usePet();
  const totalMs = minutes * msPerMinute;
  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [peeks, setPeeks] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const finished = useRef(false);

  const finish = (early: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const done = Math.min(minutes, Math.floor((Date.now() - startedAt.current) / msPerMinute));
    const reward = focusReward(done, peeks, early);
    const goalsDone = early
      ? []
      : goals.filter((g) => !g.done && g.focusMinutes && done >= g.focusMinutes).map((g) => g.title);
    const goalSparks = goals.filter((g) => goalsDone.includes(g.title)).reduce((sum, g) => sum + g.reward, 0);
    const before = levelFor(xp);
    const after = levelFor(xp + reward.xp);

    finishFocus(done, peeks, early);
    onFinish({
      minutes: done,
      early,
      peeks,
      sparks: reward.sparks + goalSparks,
      energy: reward.effect.energy ?? 0,
      mood: reward.effect.mood ?? 0,
      xp: reward.xp,
      goalsDone,
      grewInto: after.level > before.level ? after.stage : null,
    });
  };

  // Pause Mimo's needs from drifting while the session runs.
  useEffect(() => {
    setFocusing(true);
    return () => setFocusing(false);
  }, [setFocusing]);

  useEffect(() => {
    const timer = setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsed(ms);
      if (ms >= totalMs) finish(false);
    }, 250);
    return () => clearInterval(timer);
  });

  // Coming back from another app mid-session counts as a peek.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') setPeeks((p) => p + 1);
    });
    return () => sub.remove();
  }, []);

  const remaining = Math.max(0, totalMs - elapsed);
  const remainingMinutes = remaining / msPerMinute;
  const mm = Math.floor(remainingMinutes);
  const ss = Math.floor((remainingMinutes - mm) * 60);
  const earnedSoFar = Math.floor(elapsed / msPerMinute) * SPARKS_PER_MINUTE;

  return (
    <SafeAreaView style={styles.running}>
      <Text style={styles.nightCaption}>{name} is napping with you</Text>
      <Text style={styles.timer}>
        {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
      </Text>

      <View style={styles.sleeper}>
        <FloatingZ />
        <View style={styles.sleeperCircle}>
          <MimoCharacter size={150} mood="sleepy" />
        </View>
      </View>

      <View style={styles.nightProgress}>
        <HatchedProgress value={Math.min(1, elapsed / totalMs)} duration={250} />
      </View>
      <Text style={styles.nightBody}>Put your phone face-down. +{earnedSoFar} sparks so far</Text>
      {peeks > 0 && (
        <Text style={styles.nightNote}>
          {name} stirred, you left {peeks === 1 ? 'once' : `${peeks} times`}. Stay a little longer?
        </Text>
      )}

      <Pressable
        onPress={() => (confirmEnd ? finish(true) : setConfirmEnd(true))}
        style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}>
        <Text style={styles.endText}>
          {confirmEnd ? 'Tap again to wake Mimo (half sparks)' : 'Wake Mimo early'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

/** Three little z's that drift up and fade, looping. */
function FloatingZ() {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return (
    <View style={styles.zs} pointerEvents="none">
      {[0, 1, 2].map((i) => {
        const phase = Animated.modulo(Animated.add(t, i / 3), 1);
        return (
          <Animated.Text
            key={i}
            style={[
              styles.z,
              {
                opacity: phase.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
                  { translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
                ],
              },
            ]}>
            z
          </Animated.Text>
        );
      })}
    </View>
  );
}

function Done({ summary }: { summary: Summary }) {
  const { name, xp, stage, nextLevel, sparks } = usePet();
  const progress = nextLevel ? 1 - (nextLevel.xp - xp) / (nextLevel.xp - levelFor(xp).xp) : 1;

  return (
    <SafeAreaView style={styles.setup}>
      <View style={styles.doneSparkles}>
        <Sparkle size={18} />
        <Sparkle size={12} />
      </View>
      <MimoCharacter size={150} mood={summary.early ? 'calm' : 'joyful'} />
      <Text style={styles.title}>{summary.early ? 'Welcome back' : 'You did it!'}</Text>
      <Text style={styles.body}>
        {summary.minutes} phone-free {summary.minutes === 1 ? 'minute' : 'minutes'}.{' '}
        {summary.early ? `${name} is glad for every one of them.` : `${name} feels so rested and loved.`}
      </Text>

      {summary.grewInto && (
        <View style={styles.levelUp}>
          <Sparkle size={14} color={Palette.white} />
          <Text style={styles.levelUpText}>
            {name} grew into a {summary.grewInto}!
          </Text>
        </View>
      )}

      <View style={styles.rewardCard}>
        <Text style={styles.rewardHeading}>What your time gave {name}</Text>
        <View style={styles.rewardRow}>
          <RewardChip label={`+${summary.sparks} sparks`} />
          <RewardChip label={`${summary.energy >= 0 ? '+' : ''}${summary.energy} energy`} />
          <RewardChip label={`${summary.mood >= 0 ? '+' : ''}${summary.mood} mood`} />
          <RewardChip label={`+${summary.xp} growth`} />
        </View>
        {summary.goalsDone.map((g) => (
          <Text key={g} style={styles.goalDone}>
            ✓ Goal complete: {g}
          </Text>
        ))}
        {summary.peeks > 0 && (
          <Text style={styles.peekNote}>
            Left the app {summary.peeks}× (−{summary.peeks * 5} sparks)
          </Text>
        )}
        <View style={styles.growth}>
          <View style={styles.growthLabels}>
            <Text style={styles.growthLabel}>{stage}</Text>
            <Text style={styles.growthLabel}>
              {nextLevel ? `${nextLevel.xp - xp} growth to ${nextLevel.stage}` : 'fully grown'}
            </Text>
          </View>
          <HatchedProgress value={progress} duration={900} />
        </View>
      </View>

      <Pressable
        onPress={() => router.dismissTo('/pet')}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>Spend {sparks} sparks on {name}</Text>
      </Pressable>
      <Pressable onPress={() => router.dismissTo('/home')} hitSlop={8}>
        <Text style={styles.secondaryText}>Back home</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function RewardChip({ label }: { label: string }) {
  return (
    <View style={styles.rewardChip}>
      <Text style={styles.rewardChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  screenNight: {
    backgroundColor: Palette.ink,
  },
  pressed: {
    opacity: 0.7,
  },

  setup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  close: {
    position: 'absolute',
    top: 56,
    right: 24,
  },
  closeText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.muted,
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 36,
    color: Palette.ink,
  },
  body: {
    fontFamily: HandFonts.regular,
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    color: Palette.ink,
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  chipActive: {
    backgroundColor: Palette.ink,
  },
  chipText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  chipTextActive: {
    color: Palette.white,
  },
  rewardCard: {
    alignSelf: 'stretch',
    gap: 10,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  rewardHeading: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  rewardChipText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: Palette.ink,
  },
  toggleKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.ink,
  },
  toggleKnobOn: {
    backgroundColor: Palette.white,
    transform: [{ translateX: 18 }],
  },
  demoText: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  primary: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: Palette.ink,
  },
  primaryText: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.white,
  },
  secondaryText: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.muted,
  },

  running: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
  },
  nightCaption: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.shade,
  },
  timer: {
    fontFamily: HandFonts.bold,
    fontSize: 72,
    lineHeight: 80,
    color: Palette.white,
  },
  sleeper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleeperCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 3,
    borderColor: Palette.white,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zs: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 1,
  },
  z: {
    position: 'absolute',
    fontFamily: HandFonts.bold,
    fontSize: 26,
    color: Palette.white,
  },
  nightProgress: {
    width: 240,
  },
  nightBody: {
    fontFamily: HandFonts.regular,
    fontSize: 18,
    color: Palette.shade,
    textAlign: 'center',
  },
  nightNote: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.white,
    textAlign: 'center',
  },
  endButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.muted,
  },
  endText: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.shade,
  },

  doneSparkles: {
    flexDirection: 'row',
    gap: 120,
    marginBottom: -24,
  },
  levelUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Palette.ink,
  },
  levelUpText: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.white,
  },
  goalDone: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  peekNote: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  growth: {
    gap: 6,
    marginTop: 4,
  },
  growthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  growthLabel: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    color: Palette.ink,
  },
});
