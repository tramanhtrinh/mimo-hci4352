/**
 * Pretend screen-time numbers for a high schooler's week, for the "Your phone use"
 * card on the Progress tab. A real app would read these from the phone's
 * screen-time data; this prototype hard-codes a believable week instead.
 */

import { type AppGroup, type GoalKind, type TimeOfDay, WHEN_LABELS } from '@/state/goals';

export type UsageCategory = Exclude<AppGroup, 'all'>;

export const USAGE_CATEGORIES: UsageCategory[] = ['social', 'video', 'games'];

/** Short names for the bars, e.g. "Social · 7h 43m". */
export const CATEGORY_SHORT: Record<UsageCategory, string> = {
  social: 'Social',
  video: 'Video',
  games: 'Games',
};

/** Minutes per day, Sunday first. Weekends run higher, school nights lower. */
export const USAGE_BY_DAY: Record<UsageCategory, number[]> = {
  social: [85, 50, 55, 48, 60, 70, 95],
  video: [70, 35, 40, 30, 45, 60, 90],
  games: [60, 20, 25, 15, 30, 45, 80],
};

/** Minutes this week per app, using the same names as APPS_BY_GROUP. Each group adds up to its daily total. */
export const USAGE_BY_APP: { name: string; group: UsageCategory; minutes: number }[] = [
  { name: 'TikTok', group: 'social', minutes: 225 },
  { name: 'Instagram', group: 'social', minutes: 130 },
  { name: 'Snapchat', group: 'social', minutes: 88 },
  { name: 'BeReal', group: 'social', minutes: 20 },
  { name: 'YouTube', group: 'video', minutes: 210 },
  { name: 'Netflix', group: 'video', minutes: 110 },
  { name: 'Twitch', group: 'video', minutes: 50 },
  { name: 'Roblox', group: 'games', minutes: 120 },
  { name: 'Clash Royale', group: 'games', minutes: 70 },
  { name: 'Minecraft', group: 'games', minutes: 55 },
  { name: 'Fortnite', group: 'games', minutes: 30 },
];

/** When in the day the phone gets used most, and which goal time of day that matches. */
export const PEAK_USAGE: { label: string; spoken: string; when: TimeOfDay } = {
  label: '9–11 PM',
  spoken: '9 to 11 PM',
  when: 'bed',
};

export const categoryTotal = (c: UsageCategory) => USAGE_BY_DAY[c].reduce((a, b) => a + b, 0);

export const weekTotal = () => USAGE_CATEGORIES.reduce((sum, c) => sum + categoryTotal(c), 0);

export const topApps = (count = 3) => [...USAGE_BY_APP].sort((a, b) => b.minutes - a.minutes).slice(0, count);

/** A starter goal aimed at the biggest habit: the top app in the busiest category, at the peak time. */
export function suggestedGoal(): {
  title: string;
  kind: GoalKind;
  apps: UsageCategory;
  appNames: string[];
  when: TimeOfDay;
  minutes: number;
} {
  const apps = [...USAGE_CATEGORIES].sort((a, b) => categoryTotal(b) - categoryTotal(a))[0];
  const topApp = topApps(USAGE_BY_APP.length).find((a) => a.group === apps)!.name;
  return {
    title: `No ${topApp} ${WHEN_LABELS[PEAK_USAGE.when].toLowerCase()}`,
    kind: 'avoid',
    apps,
    appNames: [topApp],
    when: PEAK_USAGE.when,
    minutes: 30,
  };
}

/** 463 → "7h 43m". */
export const formatMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

/** 463 → "7 hours 43 minutes", for screen readers. */
export function spokenMinutes(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const parts = [];
  if (h) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
  if (min || !h) parts.push(`${min} ${min === 1 ? 'minute' : 'minutes'}`);
  return parts.join(' ');
}
