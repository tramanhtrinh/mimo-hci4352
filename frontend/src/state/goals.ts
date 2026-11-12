/**
 * User-defined screen-time goals. The user picks what to change, when, how
 * long, how often and what they get for it; each scheduled day they check in
 * honestly with "I did it" or "Not today".
 */

/** avoid: stay off something for a stretch of time. limit: keep it under a budget. rest: a phone-free session with Mimo. */
export type GoalKind = 'avoid' | 'limit' | 'rest';
export type AppGroup = 'social' | 'video' | 'games' | 'all';
export type TimeOfDay = 'bed' | 'morning' | 'meals' | 'study' | 'anytime';
export type DayStatus = 'done' | 'skipped' | null;

export type Goal = {
  id: string;
  title: string;
  kind: GoalKind;
  apps: AppGroup;
  when: TimeOfDay;
  minutes: number;
  /** Which days the goal is active, Sunday first. */
  days: boolean[];
  /** Sparks earned for Mimo on each kept day. */
  reward: number;
  /** Something the user promises themselves, e.g. "read a chapter". */
  personalReward: string;
  /** The user's own reason, shown back to them on check-in. */
  why: string;
  streak: number;
  /** Check-ins for the current week, Sunday first. */
  week: DayStatus[];
};

export type GoalDraft = Omit<Goal, 'id' | 'streak' | 'week'> & { id?: string };

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const KIND_LABELS: Record<GoalKind, string> = {
  avoid: 'Stay off',
  limit: 'Limit to',
  rest: 'Rest with Mimo',
};

export const APP_LABELS: Record<AppGroup, string> = {
  social: 'Social media',
  video: 'Video apps',
  games: 'Games',
  all: 'All apps',
};

export const WHEN_LABELS: Record<TimeOfDay, string> = {
  bed: 'Before bed',
  morning: 'After waking',
  meals: 'During meals',
  study: 'While studying',
  anytime: 'Any time',
};

export const DURATION_OPTIONS = [10, 15, 30, 45, 60, 90, 120];
export const REWARD_OPTIONS = [10, 20, 30, 50];

export const EVERY_DAY = [true, true, true, true, true, true, true];
export const WEEKDAYS = [false, true, true, true, true, true, false];
export const WEEKENDS = [true, false, false, false, false, false, true];

export const todayIndex = () => new Date().getDay();

const sameDays = (a: boolean[], b: boolean[]) => a.every((d, i) => d === b[i]);

export function frequencyLabel(days: boolean[]) {
  if (sameDays(days, EVERY_DAY)) return 'Every day';
  if (sameDays(days, WEEKDAYS)) return 'Weekdays';
  if (sameDays(days, WEEKENDS)) return 'Weekends';
  const picked = DAY_NAMES.filter((_, i) => days[i]);
  return picked.length ? picked.join(', ') : 'No days picked';
}

const APP_PHRASE: Record<AppGroup, string> = {
  social: 'social media',
  video: 'video apps',
  games: 'games',
  all: 'your phone',
};

const WHEN_PHRASE: Record<TimeOfDay, string> = {
  bed: 'before bed',
  morning: 'after waking up',
  meals: 'during meals',
  study: 'while studying',
  anytime: '',
};

/** One-line plain-English version of a goal, e.g. "Stay off social media for 30 min before bed". */
export function describeGoal(g: Pick<Goal, 'kind' | 'apps' | 'when' | 'minutes'>) {
  const when = WHEN_PHRASE[g.when];
  if (g.kind === 'rest') return `Rest phone-free with Mimo for ${g.minutes} min`;
  if (g.kind === 'limit') return `Keep ${APP_PHRASE[g.apps]} under ${g.minutes} min ${when || 'a day'}`;
  return `Stay off ${APP_PHRASE[g.apps]} for ${g.minutes} min ${when}`.trim();
}

/** A gentle nudge when a goal looks hard to keep. Small wins build the habit. */
export function achievabilityTip(g: Pick<Goal, 'kind' | 'minutes' | 'days'>) {
  const dayCount = g.days.filter(Boolean).length;
  if (dayCount === 0) return 'Pick at least one day.';
  if (g.kind === 'limit' && g.minutes <= 10) return 'A very tight limit. Try a little more room and lower it later.';
  if (g.kind !== 'limit' && g.minutes >= 90 && dayCount >= 6) {
    return 'That is a big daily stretch. Starting smaller makes it easier to keep a streak.';
  }
  return null;
}

export const isScheduledToday = (g: Goal) => g.days[todayIndex()];
export const todayStatus = (g: Goal): DayStatus => g.week[todayIndex()];

/** Fake check-ins for earlier this week so the demo has some history to show. */
function seedWeek(days: boolean[], misses: number[] = []): DayStatus[] {
  const today = todayIndex();
  return days.map((on, i) => (!on || i >= today ? null : misses.includes(i) ? 'skipped' : 'done'));
}

export const TEMPLATES: (GoalDraft & { label: string })[] = [
  {
    label: 'No social before bed',
    title: 'No social media before bed',
    kind: 'avoid',
    apps: 'social',
    when: 'bed',
    minutes: 30,
    days: EVERY_DAY,
    reward: 20,
    personalReward: '',
    why: '',
  },
  {
    label: 'Phone-free meals',
    title: 'Phone-free meals',
    kind: 'avoid',
    apps: 'all',
    when: 'meals',
    minutes: 30,
    days: EVERY_DAY,
    reward: 20,
    personalReward: '',
    why: '',
  },
  {
    label: 'Less video scrolling',
    title: 'Less video scrolling',
    kind: 'limit',
    apps: 'video',
    when: 'anytime',
    minutes: 45,
    days: EVERY_DAY,
    reward: 20,
    personalReward: '',
    why: '',
  },
  {
    label: 'Focused study',
    title: 'Focused study time',
    kind: 'avoid',
    apps: 'all',
    when: 'study',
    minutes: 60,
    days: WEEKDAYS,
    reward: 30,
    personalReward: '',
    why: '',
  },
  {
    label: 'Rest with Mimo',
    title: 'Rest with Mimo',
    kind: 'rest',
    apps: 'all',
    when: 'anytime',
    minutes: 15,
    days: EVERY_DAY,
    reward: 20,
    personalReward: '',
    why: '',
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'bed',
    title: 'No social media before bed',
    kind: 'avoid',
    apps: 'social',
    when: 'bed',
    minutes: 30,
    days: EVERY_DAY,
    reward: 20,
    personalReward: 'a chapter of my book',
    why: 'I sleep better and wake up less anxious.',
    streak: 3,
    week: seedWeek(EVERY_DAY, [1]),
  },
  {
    id: 'rest',
    title: 'Rest with Mimo',
    kind: 'rest',
    apps: 'all',
    when: 'anytime',
    minutes: 15,
    days: EVERY_DAY,
    reward: 20,
    personalReward: '',
    why: '',
    streak: 2,
    week: seedWeek(EVERY_DAY, [0, 2]),
  },
  {
    id: 'dinner',
    title: 'Phone-free dinner',
    kind: 'avoid',
    apps: 'all',
    when: 'meals',
    minutes: 45,
    days: WEEKDAYS,
    reward: 15,
    personalReward: '',
    why: 'Actually talk with my roommates.',
    streak: 1,
    week: seedWeek(WEEKDAYS, [2]),
  },
];
