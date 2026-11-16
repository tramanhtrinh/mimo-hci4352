/**
 * User-defined screen-time goals. The user picks what to change, when, how
 * long, how often and what they get for it; each scheduled day they check in
 * honestly with "I did it" or "Not today".
 */

/** avoid: stay off something for a stretch of time. limit: keep it under a budget. rest: a phone-free session with Mimo. */
export type GoalKind = 'avoid' | 'limit' | 'rest';
export type AppGroup = 'social' | 'video' | 'games' | 'all';
export type TimeOfDay = 'bed' | 'morning' | 'meals' | 'study' | 'practice' | 'game' | 'anytime';
export type DayStatus = 'done' | 'skipped' | null;

export type Goal = {
  id: string;
  title: string;
  kind: GoalKind;
  apps: AppGroup;
  /** Specific apps picked within the group, e.g. ["TikTok"]. Older saved goals don't have it. */
  appNames?: string[];
  when: TimeOfDay;
  minutes: number;
  /** Which days the goal is active, Sunday first. */
  days: boolean[];
  /** Optional clock time in minutes after midnight (e.g. 990 = 4:30 PM). Older saved goals may not have it. */
  time?: number | null;
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
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

/** Apps the user can pick within each group. "All apps" has no specific picks. */
export const APPS_BY_GROUP: Record<AppGroup, string[]> = {
  social: ['Instagram', 'TikTok', 'Snapchat', 'BeReal'],
  video: ['YouTube', 'Netflix', 'Twitch'],
  games: ['Roblox', 'Fortnite', 'Minecraft', 'Clash Royale'],
  all: [],
};

export const WHEN_LABELS: Record<TimeOfDay, string> = {
  bed: 'Before bed',
  morning: 'After waking',
  meals: 'During meals',
  study: 'While studying',
  practice: 'Before practice',
  game: 'Before a game',
  anytime: 'Any time',
};

export const DURATION_OPTIONS = [10, 15, 30, 45, 60, 90, 120];
export const REWARD_OPTIONS = [10, 20, 30, 50];

export const EVERY_DAY = [true, true, true, true, true, true, true];
export const WEEKDAYS = [false, true, true, true, true, true, false];
export const WEEKENDS = [true, false, false, false, false, false, true];

export const todayIndex = () => new Date().getDay();

/** Date of this week's Sunday, used to tell when saved check-ins belong to an older week. */
export function currentWeekKey() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toDateString();
}

/** The dates of this week, Sunday first, for the Weekly Flow calendar. */
export function weekDates() {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** 990 → "4:30 PM". */
export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Steps for the time picker, and where it starts for each time of day. */
export const TIME_STEP = 30;
export const SUGGESTED_TIME: Record<TimeOfDay, number> = {
  morning: 7 * 60 + 30,
  study: 16 * 60,
  practice: 15 * 60 + 30,
  game: 17 * 60 + 30,
  meals: 18 * 60 + 30,
  bed: 22 * 60 + 30,
  anytime: 12 * 60,
};

/** Where a goal sits in the day: its own time if set, otherwise a rough slot for its time of day. */
export const sortTime = (g: Pick<Goal, 'time' | 'when'>) =>
  g.time ?? (g.when === 'anytime' ? 24 * 60 : SUGGESTED_TIME[g.when]);

/** What the time pill in the Weekly Flow shows: the clock time, or the time of day. */
export const timeLabel = (g: Pick<Goal, 'time' | 'when'>) => (g.time != null ? formatTime(g.time) : WHEN_LABELS[g.when]);

export const EMPTY_WEEK: DayStatus[] = [null, null, null, null, null, null, null];

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
  practice: 'before practice',
  game: 'before a game',
  anytime: '',
};

/** Picked app names, up to two then "+N more": "TikTok and Instagram", "TikTok, Instagram +1 more". */
function appNamesPhrase(names: string[]) {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}

/** One-line plain-English version of a goal, e.g. "Stay off social media for 30 min before bed". */
export function describeGoal(g: Pick<Goal, 'kind' | 'apps' | 'appNames' | 'when' | 'minutes'>) {
  const when = WHEN_PHRASE[g.when];
  const apps = g.apps !== 'all' && g.appNames?.length ? appNamesPhrase(g.appNames) : APP_PHRASE[g.apps];
  if (g.kind === 'rest') return `Rest phone-free with Mimo for ${g.minutes} min`;
  if (g.kind === 'limit') return `Keep ${apps} under ${g.minutes} min ${when || 'a day'}`;
  return `Stay off ${apps} for ${g.minutes} min ${when}`.trim();
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
    time: 22 * 60 + 30,
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
    time: 18 * 60 + 30,
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
    time: null,
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
    time: 16 * 60,
    reward: 30,
    personalReward: '',
    why: '',
  },
  {
    label: 'Game-day focus',
    title: 'Game-day focus',
    kind: 'avoid',
    apps: 'social',
    when: 'game',
    minutes: 60,
    days: WEEKENDS,
    time: 17 * 60 + 30,
    reward: 30,
    personalReward: '',
    why: '',
  },
  {
    label: 'Scroll-free mornings',
    title: 'Scroll-free mornings',
    kind: 'avoid',
    apps: 'social',
    when: 'morning',
    minutes: 30,
    days: EVERY_DAY,
    time: 7 * 60 + 30,
    reward: 20,
    personalReward: 'a slow breakfast first',
    why: '',
  },
  {
    label: 'Offline hobby time',
    title: 'Offline hobby time',
    kind: 'avoid',
    apps: 'all',
    when: 'anytime',
    minutes: 30,
    days: [false, true, false, true, false, true, false],
    time: 16 * 60,
    reward: 20,
    personalReward: 'doodling, crafts or journaling',
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
    time: null,
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
    time: 22 * 60 + 30,
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
    time: null,
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
    time: 18 * 60 + 30,
    reward: 15,
    personalReward: '',
    why: 'Actually talk with my roommates.',
    streak: 1,
    week: seedWeek(WEEKDAYS, [2]),
  },
];
