import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

/**
 * In-memory pet state for the demo. Completing screen-time goals earns sparks
 * and cheers Mimo up; sparks and care rituals keep Mimo's vitals high.
 */

export type StatKey = 'mood' | 'energy' | 'hunger';
export type Stats = Record<StatKey, number>;
export type RitualId = 'feed' | 'play' | 'nap';

export type Goal = {
  id: string;
  title: string;
  done: boolean;
  /** Progress shown while the goal is in progress, 0–1. */
  progress: number;
  reward: number;
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
    id: 'feed',
    title: 'Feed Snack',
    description: 'Nourish with mindful berries',
    badge: '+15 Fullness',
    cost: 10,
    effect: { hunger: 15, energy: 5 },
    reaction: 'Mimo munched the berries happily!',
  },
  {
    id: 'play',
    title: 'Play Mini-Game',
    description: 'Toss the yarn ball together',
    badge: '+15 Happiness',
    cost: 0,
    effect: { mood: 15, energy: -10, hunger: -5 },
    reaction: 'Mimo had so much fun playing with you!',
  },
  {
    id: 'nap',
    title: 'Sweet Nap',
    description: 'Calm breathing & ambient white noise',
    badge: 'Restore Stamina',
    cost: 0,
    effect: { energy: 25, mood: 5 },
    reaction: 'Mimo woke up refreshed. zzz…',
  },
];

const GOAL_MOOD_BOOST = 10;
const FEEDBACK_MS = 3000;

type State = {
  name: string;
  level: number;
  stage: string;
  streakDays: number;
  sparks: number;
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
  level: 3,
  stage: 'Sprout',
  streakDays: 3,
  sparks: 120,
  stats: { mood: 70, energy: 70, hunger: 60 },
  deltas: {},
  message: null,
  interaction: 0,
  goals: [
    { id: 'scroll', title: 'Reduce bedtime scrolling by 10m', done: true, progress: 1, reward: 20 },
    { id: 'dinner', title: 'Stay phone-free during dinner', done: false, progress: 0.4, reward: 20 },
    { id: 'walk', title: 'Take a 15m walk without your phone', done: false, progress: 0, reward: 30 },
  ],
};

type Action =
  | { type: 'ritual'; id: RitualId }
  | { type: 'completeGoal'; id: string }
  | { type: 'clearFeedback' };

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function applyEffect(stats: Stats, effect: Partial<Stats>) {
  const next = { ...stats };
  const deltas: Partial<Stats> = {};
  for (const key of Object.keys(effect) as StatKey[]) {
    next[key] = clamp(stats[key] + (effect[key] ?? 0));
    deltas[key] = next[key] - stats[key];
  }
  return { stats: next, deltas };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ritual': {
      const ritual = RITUALS.find((r) => r.id === action.id);
      if (!ritual) return state;
      if (state.sparks < ritual.cost) {
        return { ...state, deltas: {}, message: 'Not enough sparks — complete a goal to earn more!' };
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
        message: `Goal done! +${goal.reward} sparks — Mimo is proud of you.`,
        interaction: state.interaction + 1,
        goals: state.goals.map((g) => (g.id === goal.id ? { ...g, done: true, progress: 1 } : g)),
      };
    }
    case 'clearFeedback':
      return { ...state, deltas: {}, message: null };
  }
}

type PetContextValue = State & {
  doRitual: (id: RitualId) => void;
  completeGoal: (id: string) => void;
  clearFeedback: () => void;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const doRitual = useCallback((id: RitualId) => dispatch({ type: 'ritual', id }), []);
  const completeGoal = useCallback((id: string) => dispatch({ type: 'completeGoal', id }), []);
  const clearFeedback = useCallback(() => dispatch({ type: 'clearFeedback' }), []);

  // Reaction messages and "+5%" badges fade out after a few seconds.
  useEffect(() => {
    if (!state.message) return;
    const timer = setTimeout(clearFeedback, FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [state.message, state.interaction, clearFeedback]);

  const value = useMemo(
    () => ({ ...state, doRitual, completeGoal, clearFeedback }),
    [state, doRitual, completeGoal, clearFeedback],
  );

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
    mood: ['Joyful', 'Content', 'Gloomy'],
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

/** Facial expression for the bear, driven by mood. */
export function bearMood(stats: Stats): 'joyful' | 'calm' | 'sad' {
  if (stats.mood >= 85) return 'joyful';
  if (stats.mood < 40) return 'sad';
  return 'calm';
}
