/** Things sparks can buy for Mimo. Sparks only come from phone-free time and kept goals. */

export type AccessoryId = 'bow' | 'scarf' | 'glasses' | 'flower' | 'hat';

export type ShopItem = {
  id: AccessoryId;
  name: string;
  cost: number;
  blurb: string;
};

export const SHOP: ShopItem[] = [
  { id: 'bow', name: 'Ribbon Bow', cost: 30, blurb: 'A little bow for good days' },
  { id: 'scarf', name: 'Cozy Scarf', cost: 50, blurb: 'Warm and snug for winter walks' },
  { id: 'glasses', name: 'Reading Glasses', cost: 60, blurb: 'For phone-free book time' },
  { id: 'flower', name: 'Flower Crown', cost: 80, blurb: 'Picked on a mindful walk' },
  { id: 'hat', name: 'Party Hat', cost: 120, blurb: 'Celebrate a big streak' },
];

/** Sparks for opening the app and saying hi, once a day. */
export const DAILY_GIFT = 5;

export const todayKey = () => new Date().toDateString();
