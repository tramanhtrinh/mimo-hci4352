import { type ComponentType, useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  AppleIcon,
  BallIcon,
  BoltIcon,
  ChevronRight,
  HeartIcon,
  SmileIcon,
  ZzzIcon,
} from '@/components/mimo/care-icons';
import { Sparkle } from '@/components/mimo/decorations';
import { HatchedProgress } from '@/components/mimo/hatched-progress';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { SparksPill } from '@/components/mimo/sparks-pill';
import { HandFonts, Palette } from '@/constants/theme';
import {
  bearMood,
  describeStat,
  overallStatus,
  type Ritual,
  type RitualId,
  RITUALS,
  type StatKey,
  usePet,
} from '@/state/pet';

type IconComponent = ComponentType<{ size?: number; color?: string }>;

const VITALS: { key: StatKey; label: string; Icon: IconComponent }[] = [
  { key: 'mood', label: 'Mood', Icon: SmileIcon },
  { key: 'energy', label: 'Energy', Icon: BoltIcon },
  { key: 'hunger', label: 'Hunger', Icon: AppleIcon },
];

const RITUAL_ICONS: Record<RitualId, IconComponent> = {
  feed: AppleIcon,
  play: BallIcon,
  nap: ZzzIcon,
};

export default function PetScreen() {
  const { name, level, stage } = usePet();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>
              {name} · Level {level} {stage}
            </Text>
            <Sparkle size={10} color={Palette.white} />
          </View>
          <View style={styles.sparks}>
            <SparksPill />
          </View>
        </View>

        <View style={styles.stage}>
          <InkBand />
          <PetPortrait />
          <ReactionBubble />
          <VitalHarmony />
        </View>

        <CareRituals />
      </ScrollView>
    </SafeAreaView>
  );
}

/** Ink wave that runs behind the pet portrait and vitals card. */
function InkBand() {
  return (
    <View style={styles.band} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none">
        <Path
          d="M0 40 C90 10 170 70 260 40 C320 20 370 25 400 35 L400 330 C330 360 260 340 200 360 C120 385 60 350 0 360 Z"
          fill={Palette.ink}
        />
      </Svg>
    </View>
  );
}

function PetPortrait() {
  const { stats, interaction, doRitual } = usePet();
  const bounce = useRef(new Animated.Value(1)).current;

  // Hop a little whenever Mimo is cared for.
  useEffect(() => {
    if (interaction === 0) return;
    Animated.sequence([
      Animated.spring(bounce, { toValue: 1.12, useNativeDriver: true, speed: 40 }),
      Animated.spring(bounce, { toValue: 1, useNativeDriver: true, friction: 3 }),
    ]).start();
  }, [interaction, bounce]);

  return (
    <View style={styles.portrait}>
      <View style={[styles.portraitSparkle, { left: 18 }]}>
        <Sparkle size={14} />
      </View>
      <View style={[styles.portraitSparkle, { right: 18 }]}>
        <Sparkle size={12} />
      </View>
      <View style={styles.ring}>
        {/* tapping Mimo is a quick way to say hi: it counts as playing */}
        <Pressable onPress={() => doRitual('play')} accessibilityLabel="Pet Mimo" style={styles.petCircle}>
          <Animated.View style={{ transform: [{ scale: bounce }] }}>
            <MimoCharacter size={140} mood={bearMood(stats)} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

function ReactionBubble() {
  const { message } = usePet();
  return (
    <View style={styles.bubbleSlot}>
      {message && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

function VitalHarmony() {
  const { stats, deltas } = usePet();

  return (
    <View style={styles.vitals}>
      <View style={styles.vitalsHeader}>
        <View style={styles.iconBadge}>
          <HeartIcon size={16} />
        </View>
        <Text style={styles.vitalsTitle}>Vital Harmony</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{overallStatus(stats)}</Text>
        </View>
      </View>
      <View style={styles.dashedRule} />

      {VITALS.map(({ key, label, Icon }) => {
        const delta = deltas[key];
        return (
          <View key={key} style={styles.vitalRow}>
            <View style={styles.vitalTop}>
              <View style={styles.iconBadge}>
                <Icon size={15} />
              </View>
              <Text style={styles.vitalLabel}>
                {label}: {describeStat(key, stats[key])}
              </Text>
              {!!delta && (
                <View style={styles.deltaPill}>
                  <Text style={styles.deltaText}>
                    {delta > 0 ? '+' : ''}
                    {delta}%
                  </Text>
                </View>
              )}
              <Text style={styles.vitalValue}>{stats[key]}%</Text>
            </View>
            <HatchedProgress value={stats[key] / 100} duration={700} />
          </View>
        );
      })}
    </View>
  );
}

function CareRituals() {
  return (
    <View style={styles.rituals}>
      <Text style={styles.sectionTitle}>Care Rituals</Text>
      <Text style={styles.sectionHint}>Spend time with Mimo to keep it thriving</Text>
      {RITUALS.map((ritual) => (
        <RitualCard key={ritual.id} ritual={ritual} />
      ))}
    </View>
  );
}

function RitualCard({ ritual }: { ritual: Ritual }) {
  const { doRitual, sparks } = usePet();
  const Icon = RITUAL_ICONS[ritual.id];
  const affordable = sparks >= ritual.cost;

  return (
    <Pressable
      onPress={() => doRitual(ritual.id)}
      accessibilityLabel={ritual.title}
      style={({ pressed }) => [styles.ritual, pressed && styles.ritualPressed]}>
      <View style={styles.ritualIcon}>
        <Icon size={24} />
      </View>
      <View style={styles.ritualBody}>
        <View style={styles.ritualTitleRow}>
          <Text style={styles.ritualTitle}>{ritual.title}</Text>
          <View style={[styles.effectPill, ritual.id === 'nap' && styles.effectPillInk]}>
            <Text style={[styles.effectText, ritual.id === 'nap' && styles.effectTextInk]}>{ritual.badge}</Text>
          </View>
        </View>
        <Text style={styles.ritualDescription}>{ritual.description}</Text>
        {ritual.cost > 0 && (
          <Text style={[styles.ritualCost, !affordable && styles.ritualCostShort]}>
            costs {ritual.cost} sparks
          </Text>
        )}
      </View>
      <View style={styles.goButton}>
        <ChevronRight />
      </View>
    </Pressable>
  );
}

const hardShadow = { boxShadow: `4px 4px 0px ${Palette.ink}` };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  scroll: {
    paddingBottom: 32,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  topBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 10,
  },
  sparks: {
    position: 'absolute',
    right: 16,
    top: 4,
  },
  levelPill: {
    marginTop: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.ink,
  },
  levelText: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.white,
  },

  stage: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: 'center',
  },
  band: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    bottom: 0,
  },
  portrait: {
    width: 260,
    height: 230,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...hardShadow,
  },
  portraitSparkle: {
    position: 'absolute',
    top: 16,
  },
  ring: {
    padding: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Palette.muted,
    borderStyle: 'dashed',
  },
  petCircle: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleSlot: {
    minHeight: 46,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  bubbleText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
    textAlign: 'center',
  },

  vitals: {
    alignSelf: 'stretch',
    gap: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    ...hardShadow,
  },
  vitalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vitalsTitle: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 22,
    color: Palette.ink,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Palette.ink,
  },
  statusText: {
    fontFamily: HandFonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    color: Palette.white,
  },
  dashedRule: {
    borderTopWidth: 2,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalRow: {
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  vitalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vitalLabel: {
    flex: 1,
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  deltaText: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    color: Palette.ink,
  },
  vitalValue: {
    minWidth: 44,
    textAlign: 'right',
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.ink,
  },

  rituals: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: Palette.shade,
  },
  sectionTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
  sectionHint: {
    marginTop: -12,
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.muted,
  },
  ritual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
    ...hardShadow,
  },
  ritualPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    boxShadow: `2px 2px 0px ${Palette.ink}`,
  },
  ritualIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ritualBody: {
    flex: 1,
    gap: 2,
  },
  ritualTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  ritualTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 19,
    color: Palette.ink,
  },
  effectPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper,
  },
  effectPillInk: {
    backgroundColor: Palette.ink,
  },
  effectText: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    color: Palette.ink,
  },
  effectTextInk: {
    color: Palette.white,
  },
  ritualDescription: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  ritualCost: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    color: Palette.ink,
  },
  ritualCostShort: {
    textDecorationLine: 'line-through',
    color: Palette.muted,
  },
  goButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
