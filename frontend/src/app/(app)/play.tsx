import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/mimo/decorations';
import { MimoPet } from '@/components/mimo/mimo-pet';
import { HighlightTitle } from '@/components/mimo/highlight-title';
import { HandFonts, Palette, Pastel, Tint } from '@/constants/theme';
import { usePet } from '@/state/pet';

const ROUND_SECONDS = 15;
const BALL_SIZE = 52;
const TARGET_SIZE = 54;
const HIT_TOLERANCE = 24;
const TARGET_CENTER = 170;
const BALL_MIN_X = 74;
const BALL_MAX_X = 266;

export default function PlayScreen() {
  const { playMiniGame } = usePet();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [ballX, setBallX] = useState(BALL_MIN_X);
  const [message, setMessage] = useState('Tap when the yarn is in the catch ring.');
  const [catchState, setCatchState] = useState<'idle' | 'hit' | 'miss'>('idle');
  const directionRef = useRef(1);

  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setPhase('done');
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;

    const mover = setInterval(() => {
      setBallX((current) => {
        let next = current + directionRef.current * 18;
        if (next <= BALL_MIN_X) {
          directionRef.current = 1;
          next = BALL_MIN_X;
        }
        if (next >= BALL_MAX_X) {
          directionRef.current = -1;
          next = BALL_MAX_X;
        }
        return next;
      });
    }, 90);

    return () => clearInterval(mover);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') return;
    playMiniGame(score);
  }, [phase, playMiniGame, score]);

  useEffect(() => {
    if (catchState === 'idle') return;

    const timeout = setTimeout(() => {
      setCatchState('idle');
    }, 420);

    return () => clearTimeout(timeout);
  }, [catchState]);

  const catchYarn = () => {
    if (phase !== 'playing') return;

    const hit = Math.abs(ballX - TARGET_CENTER) <= HIT_TOLERANCE;
    setCatchState(hit ? 'hit' : 'miss');
    setScore((current) => (hit ? current + 1 : current));
    setMessage(hit ? 'Nice catch! Mimo is delighted!' : 'Too early or too late. Try again!');

    if (hit) {
      setBallX(BALL_MIN_X);
      directionRef.current = 1;
    }
  };

  const startRound = () => {
    setPhase('playing');
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setBallX(BALL_MIN_X);
    directionRef.current = 1;
    setMessage('Tap when the yarn is in the catch ring.');
  };

  const finalText =
    score >= 8 ? 'Amazing teamwork!' : score >= 4 ? 'Great game!' : score > 0 ? 'Cute try!' : 'Mimo still had fun!';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Text style={styles.backText}>back</Text>
        </Pressable>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerValue}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.gameBoard}>
        <View style={styles.sparkleLeft}>
          <Sparkle size={16} />
        </View>
        <View style={styles.sparkleRight}>
          <Sparkle size={14} />
        </View>

        <View style={styles.catchLane}>
          <View style={styles.catchTarget} />
        </View>

        {catchState !== 'idle' && (
          <View
            style={[
              styles.catchBadge,
              catchState === 'hit' ? styles.catchBadgeHit : styles.catchBadgeMiss,
            ]}
          >
            <Text style={styles.catchBadgeText}>{catchState === 'hit' ? 'Caught!' : 'Miss!'}</Text>
          </View>
        )}

        <View style={styles.mimoLane}>
          <MimoPet size={124} />
        </View>

        <Animated.View
          style={[
            styles.yarnBall,
            {
              left: ballX - BALL_SIZE / 2,
              transform: [{ scale: catchState === 'hit' ? 1.18 : 1 }],
            },
          ]}
        >
          <Text style={styles.yarnText}>🧶</Text>
        </Animated.View>

        <View
          style={[
            styles.targetRing,
            { left: TARGET_CENTER - TARGET_SIZE / 2 },
            catchState === 'hit' && styles.targetRingHit,
            catchState === 'miss' && styles.targetRingMiss,
          ]}
        />
      </View>

      <View style={styles.footer}>
        <HighlightTitle textStyle={styles.title}>Yarn toss</HighlightTitle>
        <Text style={styles.message}>{phase === 'done' ? finalText : message}</Text>

        {phase === 'ready' && (
          <Pressable onPress={startRound} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Start game</Text>
          </Pressable>
        )}

        {phase === 'playing' && (
          <Pressable onPress={catchYarn} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Catch it!</Text>
          </Pressable>
        )}

        {phase === 'done' && (
          <Pressable
            onPress={() => {
              setPhase('ready');
              setScore(0);
              setTimeLeft(ROUND_SECONDS);
              setMessage('Ready for another round?');
              setBallX(BALL_MIN_X);
              directionRef.current = 1;
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Play again</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
    letterSpacing: 0.6,
    textTransform: 'lowercase',
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Palette.ink,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreLabel: {
    fontFamily: HandFonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: Palette.ink,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontFamily: HandFonts.bold,
    fontSize: 22,
    color: Palette.ink,
  },
  timerBox: {
    backgroundColor: Pastel.blush,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  timerValue: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },
  gameBoard: {
    position: 'relative',
    height: 420,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Tint.sky,
    borderWidth: 3,
    borderColor: Palette.ink,
  },
  sparkleLeft: {
    position: 'absolute',
    left: 18,
    top: 18,
  },
  sparkleRight: {
    position: 'absolute',
    right: 26,
    top: 38,
  },
  catchLane: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 42,
    height: 90,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catchTarget: {
    width: 120,
    height: 42,
    borderRadius: 999,
    backgroundColor: Pastel.butter,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  mimoLane: {
    position: 'absolute',
    left: 105,
    right: 105,
    bottom: 72,
    alignItems: 'center',
  },
  yarnBall: {
    position: 'absolute',
    bottom: 136,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Pastel.butter,
    borderWidth: 2,
    borderColor: Palette.ink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  yarnText: {
    fontSize: 22,
  },
  targetRing: {
    position: 'absolute',
    bottom: 120,
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: Palette.ink,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  targetRingHit: {
    borderColor: '#2f9d65',
    backgroundColor: 'rgba(115, 220, 170, 0.45)',
    shadowColor: '#2f9d65',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  targetRingMiss: {
    borderColor: '#d75d5d',
    backgroundColor: 'rgba(255, 165, 165, 0.28)',
    shadowColor: '#d75d5d',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  catchBadge: {
    position: 'absolute',
    top: 18,
    left: '50%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Palette.ink,
    zIndex: 2,
  },
  catchBadgeHit: {
    backgroundColor: '#dff7e9',
  },
  catchBadgeMiss: {
    backgroundColor: '#ffe1e1',
  },
  catchBadgeText: {
    fontFamily: HandFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: Palette.ink,
    textTransform: 'uppercase',
  },
  footer: {
    paddingTop: 18,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 26,
    color: Palette.ink,
  },
  message: {
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.ink,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  primaryButton: {
    backgroundColor: Palette.ink,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 220,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  primaryText: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.white,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
