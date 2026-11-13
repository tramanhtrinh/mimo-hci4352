import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import { petStorageKey } from '@/state/auth';
import {
  currentWeekKey,
  EMPTY_WEEK,
  type Goal,
  type GoalDraft,
  INITIAL_GOALS,
  isScheduledToday,
  todayIndex,
  todayStatus,
} from '@/state/goals';
import { type AccessoryId, DAILY_GIFT, SHOP, todayKey } from '@/state/shop';

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

export type { Goal } from '@/state/goals';

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
  /** Phone-free minutes for each day of the current week, Sunday first. */
  phoneFreeByDay: number[];
  totalPhoneFreeMinutes: number;
  sessions: number;
  dailyGoalMinutes: number;
  owned: AccessoryId[];
  equipped: AccessoryId | null;
  /** Day the daily gift was last claimed. */
  lastGiftDay: string | null;
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

/** Some phone-free history earlier this week so the demo's Progress tab has a story. */
function seedMinutes() {
  const today = todayIndex();
  return [30, 45, 20, 55, 15, 40, 35].map((m, i) => (i < today ? m : i === today ? 25 : 0));
}

const initialState: State = {
  name: 'Mimo',
  streakDays: 3,
  sparks: 20,
  xp: 175,
  phoneFreeByDay: seedMinutes(),
  totalPhoneFreeMinutes: 640,
  sessions: 18,
  dailyGoalMinutes: 60,
  owned: ['bow'],
  equipped: null,
  lastGiftDay: null,
  focusing: false,
  // Mimo starts the demo a bit sleepy, so the first thing it asks for is phone-free rest.
  stats: { mood: 62, energy: 38, hunger: 55 },
  deltas: {},
  message: null,
  interaction: 0,
  goals: INITIAL_GOALS,
};

/** Brand-new accounts start from scratch: a young Mimo and no goals yet. */
const newUserState: State = {
  ...initialState,
  streakDays: 0,
  sparks: 20,
  xp: 0,
  phoneFreeByDay: [0, 0, 0, 0, 0, 0, 0],
  totalPhoneFreeMinutes: 0,
  sessions: 0,
  owned: [],
  stats: { mood: 60, energy: 38, hunger: 55 },
  goals: [],
};

/** The parts of state worth keeping between visits. */
const SAVED_KEYS = [
  'streakDays',
  'sparks',
  'xp',
  'phoneFreeByDay',
  'totalPhoneFreeMinutes',
  'sessions',
  'dailyGoalMinutes',
  'owned',
  'equipped',
  'lastGiftDay',
  'stats',
  'goals',
] as const;
type SavedState = Pick<State, (typeof SAVED_KEYS)[number]> & { weekKey: string };

function toSaved(state: State): SavedState {
  const saved = Object.fromEntries(SAVED_KEYS.map((k) => [k, state[k]])) as Pick<State, (typeof SAVED_KEYS)[number]>;
  return { ...saved, weekKey: currentWeekKey() };
}

function fromSaved(saved: Partial<SavedState>, fresh: State): State {
  const merged = { ...fresh, ...saved };
  // Check-ins and daily minutes from an earlier week don't carry into this week.
  if (saved.weekKey !== currentWeekKey()) {
    merged.goals = merged.goals.map((g) => ({ ...g, week: EMPTY_WEEK }));
    merged.phoneFreeByDay = [0, 0, 0, 0, 0, 0, 0];
  }
  return merged;
}

type Action =
  | { type: 'ritual'; id: RitualId }
  | { type: 'checkIn'; id: string; status: 'done' | 'skipped' }
  | { type: 'saveGoal'; draft: GoalDraft }
  | { type: 'deleteGoal'; id: string }
  | { type: 'setFocusing'; focusing: boolean }
  | { type: 'finishFocus'; minutes: number; peeks: number; early: boolean }
  | { type: 'decay' }
  | { type: 'clearFeedback' }
  | { type: 'load'; state: State }
  | { type: 'buy'; id: AccessoryId }
  | { type: 'equip'; id: AccessoryId | null }
  | { type: 'claimGift' };

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
    case 'checkIn': {
      const goal = state.goals.find((g) => g.id === action.id);
      if (!goal || !isScheduledToday(goal) || todayStatus(goal) === 'done') return state;
      const today = todayIndex();
      const week = goal.week.map((d, i) => (i === today ? action.status : d));

      if (action.status === 'skipped') {
        // No sparks lost: honesty is the point. The streak just starts over.
        return {
          ...state,
          deltas: {},
          message: 'Thanks for being honest. Tomorrow is a fresh start, and Mimo still loves you.',
          goals: state.goals.map((g) => (g.id === goal.id ? { ...g, week, streak: 0 } : g)),
        };
      }

      const { stats, deltas } = applyEffect(state.stats, { mood: GOAL_MOOD_BOOST });
      const treat = goal.personalReward ? ` Enjoy ${goal.personalReward}!` : '';
      return {
        ...state,
        sparks: state.sparks + goal.reward,
        stats,
        deltas,
        message: `Goal kept! +${goal.reward} sparks for Mimo.${treat}`,
        interaction: state.interaction + 1,
        goals: state.goals.map((g) => (g.id === goal.id ? { ...g, week, streak: g.streak + 1 } : g)),
      };
    }
    case 'saveGoal': {
      const { draft } = action;
      if (draft.id) {
        return {
          ...state,
          goals: state.goals.map((g) => (g.id === draft.id ? { ...g, ...draft, id: g.id } : g)),
          message: 'Goal updated. Adjusting is part of the process!',
        };
      }
      const goal: Goal = { ...draft, id: `goal-${Date.now()}`, streak: 0, week: EMPTY_WEEK };
      return { ...state, goals: [...state.goals, goal], message: 'New goal set. Mimo believes in you!' };
    }
    case 'deleteGoal':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };
    case 'setFocusing':
      return { ...state, focusing: action.focusing };
    case 'finishFocus': {
      const { minutes, peeks, early } = action;
      const reward = focusReward(minutes, peeks, early);
      const { stats, deltas } = applyEffect(state.stats, reward.effect);

      // Long enough sessions check in "Rest with Mimo" goals for today and pay their reward too.
      const completed = early ? [] : restGoalsKeptBy(state.goals, minutes);
      const goalSparks = completed.reduce((sum, g) => sum + g.reward, 0);
      const today = todayIndex();
      const goals = state.goals.map((g) =>
        completed.includes(g)
          ? { ...g, streak: g.streak + 1, week: g.week.map((d, i) => (i === today ? ('done' as const) : d)) }
          : g,
      );

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
        phoneFreeByDay: state.phoneFreeByDay.map((m, i) => (i === today ? m + minutes : m)),
        totalPhoneFreeMinutes: state.totalPhoneFreeMinutes + minutes,
        sessions: minutes > 0 ? state.sessions + 1 : state.sessions,
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
    case 'load':
      return action.state;
    case 'buy': {
      const item = SHOP.find((i) => i.id === action.id);
      if (!item || state.owned.includes(item.id)) return state;
      if (state.sparks < item.cost) {
        return { ...state, message: `${item.cost - state.sparks} more sparks needed. Phone-free time earns ${SPARKS_PER_MINUTE} a minute!` };
      }
      const { stats, deltas } = applyEffect(state.stats, { mood: 10 });
      return {
        ...state,
        sparks: state.sparks - item.cost,
        owned: [...state.owned, item.id],
        equipped: item.id,
        stats,
        deltas,
        message: `${item.name} unlocked! Your phone-free time paid for this.`,
        interaction: state.interaction + 1,
      };
    }
    case 'equip':
      if (action.id && !state.owned.includes(action.id)) return state;
      return { ...state, equipped: action.id, interaction: state.interaction + 1 };
    case 'claimGift': {
      if (state.lastGiftDay === todayKey()) return state;
      return {
        ...state,
        sparks: state.sparks + DAILY_GIFT,
        lastGiftDay: todayKey(),
        message: `+${DAILY_GIFT} sparks. Thanks for checking in today!`,
        interaction: state.interaction + 1,
      };
    }
  }
}

/** "Rest with Mimo" goals a session of this length would complete today. */
export function restGoalsKeptBy(goals: Goal[], minutes: number) {
  return goals.filter((g) => g.kind === 'rest' && isScheduledToday(g) && todayStatus(g) !== 'done' && minutes >= g.minutes);
}

type PetContextValue = State & {
  level: number;
  stage: string;
  nextLevel: (typeof LEVELS)[number] | undefined;
  doRitual: (id: RitualId) => void;
  checkIn: (id: string, status: 'done' | 'skipped') => void;
  saveGoal: (draft: GoalDraft) => void;
  deleteGoal: (id: string) => void;
  setFocusing: (focusing: boolean) => void;
  finishFocus: (minutes: number, peeks: number, early: boolean) => void;
  buyItem: (id: AccessoryId) => void;
  equipItem: (id: AccessoryId | null) => void;
  claimGift: () => void;
  clearFeedback: () => void;
  /** Today's phone-free minutes. */
  phoneFreeMinutes: number;
  giftAvailable: boolean;
};

const PetContext = createContext<PetContextValue | null>(null);

type PetProviderProps = {
  userId: string;
  /** The companion's name, chosen by the user at sign-up. */
  petName: string;
  children: ReactNode;
};

/** Holds one user's pet, goals and sparks, saved on the device under their account. */
export function PetProvider({ userId, petName, children }: PetProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(petStorageKey(userId))
      .then((raw) => {
        if (cancelled) return;
        const fresh = userId === 'demo' ? initialState : newUserState;
        dispatch({ type: 'load', state: raw ? fromSaved(JSON.parse(raw), fresh) : fresh });
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(petStorageKey(userId), JSON.stringify(toSaved(state))).catch(() => {});
  }, [loaded, state, userId]);

  const doRitual = useCallback((id: RitualId) => dispatch({ type: 'ritual', id }), []);
  const checkIn = useCallback(
    (id: string, status: 'done' | 'skipped') => dispatch({ type: 'checkIn', id, status }),
    [],
  );
  const saveGoal = useCallback((draft: GoalDraft) => dispatch({ type: 'saveGoal', draft }), []);
  const deleteGoal = useCallback((id: string) => dispatch({ type: 'deleteGoal', id }), []);
  const setFocusing = useCallback((focusing: boolean) => dispatch({ type: 'setFocusing', focusing }), []);
  const finishFocus = useCallback(
    (minutes: number, peeks: number, early: boolean) => dispatch({ type: 'finishFocus', minutes, peeks, early }),
    [],
  );
  const clearFeedback = useCallback(() => dispatch({ type: 'clearFeedback' }), []);
  const buyItem = useCallback((id: AccessoryId) => dispatch({ type: 'buy', id }), []);
  const equipItem = useCallback((id: AccessoryId | null) => dispatch({ type: 'equip', id }), []);
  const claimGift = useCallback(() => dispatch({ type: 'claimGift' }), []);

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
      name: petName,
      phoneFreeMinutes: state.phoneFreeByDay[todayIndex()],
      giftAvailable: state.lastGiftDay !== todayKey(),
      buyItem,
      equipItem,
      claimGift,
      level,
      stage,
      nextLevel: next,
      doRitual,
      checkIn,
      saveGoal,
      deleteGoal,
      setFocusing,
      finishFocus,
      clearFeedback,
    };
  }, [
    state,
    petName,
    doRitual,
    checkIn,
    saveGoal,
    deleteGoal,
    setFocusing,
    finishFocus,
    buyItem,
    equipItem,
    claimGift,
    clearFeedback,
  ]);

  if (!loaded) return null;
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
