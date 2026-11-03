import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

/**
 * In-memory pet state for the demo.
 *
 * The core loop: phone-free time is how Mimo rests and how you earn sparks.
 * Sparks buy treats and play, and phone-free minutes also grow Mimo's level.
 * Mimo's needs slowly drift down over time, so there's always a gentle reason
 * to come back and put the phone down again.
 */

export type StatKey = 'mood' | 'energy' | 'hunger';
export type Stats = Record<StatKey, number>;
export type RitualId = 'rest' | 'feed' | 'play';

export type Goal = {
  id: string;
  title: string;
  done: boolean;
  reward: number;
  /** Completes automatically after a phone-free session of at least this many minutes. */
  focusMinutes?: number;
};

export type Ritual = {
  id: RitualId;
  title: string;
  description: string;
  badge: string;
  cost: number;
  effect: Partial<Stats>;
  reaction: string;
};

export const RITUALS: Ritual[] = [
  {
    id: 'rest',
    title: 'Rest Together',
    description: 'Put your phone down and nap with Mimo',
    badge: 'Earns sparks',
    cost: 0,
    effect: {},
    reaction: '',
  },
  {
    id: 'feed',
    title: 'Feed Snack',
    description: 'Mindful berries, bought with sparks',
    badge: '+20 Fullness',
    cost: 15,
    effect: { hunger: 20, mood: 5 },
    reaction: 'Mimo munched the berries happily!',
  },
  {
    id: 'play',
    title: 'Play Mini-Game',
    description: 'Toss the yarn ball together',
    badge: '+15 Happiness',
    cost: 10,
    effect: { mood: 15, energy: -10, hunger: -5 },
    reaction: 'Mimo had so much fun playing with you!',
  },
];

export const LEVELS = [
  { level: 1, stage: 'Seed', xp: 0 },
  { level: 2, stage: 'Bud', xp: 60 },
  { level: 3, stage: 'Sprout', xp: 120 },
  { level: 4, stage: 'Bloom', xp: 220 },
  { level: 5, stage: 'Blossom', xp: 360 },
] as const;

export const SPARKS_PER_MINUTE = 2;
const PEEK_PENALTY = 5;
const GOAL_MOOD_BOOST = 10;
const FEEDBACK_MS = 3500;
/** Needs drift down a little every tick while the phone is in use. */
const DECAY_EVERY_MS = 20_000;

type State = {
  name: string;
  streakDays: number;
  sparks: number;
  xp: number;
  phoneFreeMinutes: number;
  dailyGoalMinutes: number;
  focusing: boolean;
  stats: Stats;
  /** Most recent change per stat, shown as a "+5%" badge. */
  deltas: Partial<Stats>;
  /** Short line describing Mimo's latest reaction. */
  message: string | null;
  /** Bumps on every interaction so the pet can bounce. */
  interaction: number;
  goals: Goal[];
};

const initialState: State = {
  name: 'Mimo',
  streakDays: 3,
  sparks: 20,
  xp: 175,
  phoneFreeMinutes: 25,
  dailyGoalMinutes: 60,
  focusing: false,
  // Mimo starts the demo a bit sleepy, so the first thing it asks for is phone-free rest.
  stats: { mood: 62, energy: 38, hunger: 55 },
  deltas: {},
  message: null,
  interaction: 0,
  goals: [
    { id: 'scroll', title: 'Reduce bedtime scrolling by 10m', done: true, reward: 20 },
    { id: 'rest', title: 'Rest with Mimo phone-free for 15m', done: false, reward: 20, focusMinutes: 15 },
    { id: 'dinner', title: 'Stay phone-free during dinner', done: false, reward: 20 },
  ],
};

type Action =
  | { type: 'ritual'; id: RitualId }
  | { type: 'completeGoal'; id: string }
  | { type: 'setFocusing'; focusing: boolean }
  | { type: 'finishFocus'; minutes: number; peeks: number; early: boolean }
  | { type: 'decay' }
  | { type: 'clearFeedback' };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function applyEffect(stats: Stats, effect: Partial<Stats>) {
  const next = { ...stats };
  const deltas: Partial<Stats> = {};
  for (const key of Object.keys(effect) as StatKey[]) {
    next[key] = clamp(stats[key] + (effect[key] ?? 0));
    if (next[key] !== stats[key]) deltas[key] = next[key] - stats[key];
  }
  return { stats: next, deltas };
}

export function levelFor(xp: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) current = l;
  const next = LEVELS.find((l) => l.xp > xp);
  return { ...current, next };
}

/** What a phone-free session gives back. Ending early still counts every minute, just less. */
export function focusReward(minutes: number, peeks: number, early: boolean) {
  const base = minutes * SPARKS_PER_MINUTE;
  const sparks = Math.max(0, Math.round((early ? base / 2 : base) - peeks * PEEK_PENALTY));
  const effect: Partial<Stats> = early
    ? { energy: Math.round(minutes / 2), mood: -3 }
    : { energy: Math.min(40, minutes + 10), mood: 10 };
  return { sparks, xp: minutes * 2, effect };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ritual': {
      const ritual = RITUALS.find((r) => r.id === action.id);
      if (!ritual || ritual.id === 'rest') return state;
      if (state.sparks < ritual.cost) {
        const short = ritual.cost - state.sparks;
        return {
          ...state,
          deltas: {},
          message: `You need ${short} more sparks. Every phone-free minute earns ${SPARKS_PER_MINUTE}!`,
        };
      }
      const { stats, deltas } = applyEffect(state.stats, ritual.effect);
      return {
        ...state,
        sparks: state.sparks - ritual.cost,
        stats,
        deltas,
        message: ritual.reaction,
        interaction: state.interaction + 1,
      };
    }
    case 'completeGoal': {
      const goal = state.goals.find((g) => g.id === action.id);
      if (!goal || goal.done) return state;
      const { stats, deltas } = applyEffect(state.stats, { mood: GOAL_MOOD_BOOST });
      return {
        ...state,
        sparks: state.sparks + goal.reward,
        stats,
        deltas,
        message: `Goal done! +${goal.reward} sparks. Mimo is proud of you.`,
        interaction: state.interaction + 1,
        goals: state.goals.map((g) => (g.id === goal.id ? { ...g, done: true } : g)),
      };
    }
    case 'setFocusing':
      return { ...state, focusing: action.focusing };
    case 'finishFocus': {
      const { minutes, peeks, early } = action;
      const reward = focusReward(minutes, peeks, early);
      const { stats, deltas } = applyEffect(state.stats, reward.effect);

      // Long enough sessions tick off matching goals and pay their reward too.
      let goalSparks = 0;
      const goals = state.goals.map((g) => {
        if (!g.done && !early && g.focusMinutes && minutes >= g.focusMinutes) {
          goalSparks += g.reward;
          return { ...g, done: true };
        }
        return g;
      });

      const xp = state.xp + reward.xp;
      const grew = levelFor(xp).level > levelFor(state.xp).level;
      const message = grew
        ? `Mimo grew into a ${levelFor(xp).stage}! All from your phone-free time.`
        : early
          ? 'Every minute counts. Mimo is glad you came back.'
          : 'Mimo feels so rested. Thank you for the phone-free time!';

      return {
        ...state,
        focusing: false,
        sparks: state.sparks + reward.sparks + goalSparks,
        xp,
        phoneFreeMinutes: state.phoneFreeMinutes + minutes,
        stats,
        deltas,
        goals,
        message,
        interaction: state.interaction + 1,
      };
    }
    case 'decay': {
      if (state.focusing) return state;
      const stats = applyEffect(state.stats, { mood: -1, energy: -1, hunger: -1 }).stats;
      return { ...state, stats };
    }
    case 'clearFeedback':
      return { ...state, deltas: {}, message: null };
  }
}

type PetContextValue = State & {
  level: number;
  stage: string;
  nextLevel: (typeof LEVELS)[number] | undefined;
  doRitual: (id: RitualId) => void;
  completeGoal: (id: string) => void;
  setFocusing: (focusing: boolean) => void;
  finishFocus: (minutes: number, peeks: number, early: boolean) => void;
  clearFeedback: () => void;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const doRitual = useCallback((id: RitualId) => dispatch({ type: 'ritual', id }), []);
  const completeGoal = useCallback((id: string) => dispatch({ type: 'completeGoal', id }), []);
  const setFocusing = useCallback((focusing: boolean) => dispatch({ type: 'setFocusing', focusing }), []);
  const finishFocus = useCallback(
    (minutes: number, peeks: number, early: boolean) => dispatch({ type: 'finishFocus', minutes, peeks, early }),
    [],
  );
  const clearFeedback = useCallback(() => dispatch({ type: 'clearFeedback' }), []);

  // Reaction messages and "+5%" badges fade out after a few seconds.
  useEffect(() => {
    if (!state.message) return;
    const timer = setTimeout(clearFeedback, FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [state.message, state.interaction, clearFeedback]);

  useEffect(() => {
    const timer = setInterval(() => dispatch({ type: 'decay' }), DECAY_EVERY_MS);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => {
    const { level, stage, next } = levelFor(state.xp);
    return {
      ...state,
      level,
      stage,
      nextLevel: next,
      doRitual,
      completeGoal,
      setFocusing,
      finishFocus,
      clearFeedback,
    };
  }, [state, doRitual, completeGoal, setFocusing, finishFocus, clearFeedback]);

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePet() {
  const value = useContext(PetContext);
  if (!value) throw new Error('usePet must be used inside <PetProvider>');
  return value;
}

/** Word describing a stat level, e.g. "Mood: Joyful". */
export function describeStat(key: StatKey, value: number) {
  const words: Record<StatKey, [string, string, string]> = {
    mood: ['Joyful', 'Content', 'Lonely'],
    energy: ['Well-Rested', 'Okay', 'Sleepy'],
    hunger: ['Satisfied', 'Peckish', 'Hungry'],
  };
  const [high, mid, low] = words[key];
  return value >= 70 ? high : value >= 40 ? mid : low;
}

/** Overall wellbeing label shown on the Vital Harmony card. */
export function overallStatus(stats: Stats) {
  const average = (stats.mood + stats.energy + stats.hunger) / 3;
  if (average >= 75) return 'THRIVING';
  if (average >= 45) return 'STEADY';
  return 'NEEDS CARE';
}

export type BearMood = 'joyful' | 'calm' | 'sad' | 'sleepy';

/** Facial expression for the bear, driven by its lowest need. */
export function bearMood(stats: Stats): BearMood {
  if (stats.energy < 40) return 'sleepy';
  if (stats.mood < 40 || stats.hunger < 30) return 'sad';
  if (stats.mood >= 85) return 'joyful';
  return 'calm';
}

export type Need = {
  /** What Mimo says, in its own voice. */
  says: string;
  action: RitualId;
  cta: string;
};

/** Mimo's most pressing need right now, and what the user can do about it. */
export function currentNeed(stats: Stats): Need {
  const lowest = (Object.keys(stats) as StatKey[]).reduce((a, b) => (stats[a] <= stats[b] ? a : b));
  if (stats[lowest] < 50) {
    if (lowest === 'energy') {
      return { says: "I'm so sleepy… will you put your phone down and rest with me?", action: 'rest', cta: 'Rest together' };
    }
    if (lowest === 'hunger') {
      return { says: 'My tummy is rumbling… could we earn sparks for a berry snack?', action: 'feed', cta: 'Feed Mimo' };
    }
    return { says: 'I missed you! Can we play for a bit?', action: 'play', cta: 'Play together' };
  }
  return {
    says: 'I feel cozy! Every phone-free minute helps me grow.',
    action: 'rest',
    cta: 'Start phone-free time',
  };
}
