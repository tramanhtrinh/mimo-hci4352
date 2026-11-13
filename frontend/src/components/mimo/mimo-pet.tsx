import { type BearMood, MimoCharacter } from '@/components/mimo/mimo-bear';
import { bearMood, usePet } from '@/state/pet';

/** The signed-in user's companion: mood follows its needs and it wears whatever is equipped. */
export function MimoPet({ size, mood }: { size?: number; mood?: BearMood }) {
  const { stats, equipped } = usePet();
  return <MimoCharacter size={size} mood={mood ?? bearMood(stats)} accessory={equipped} />;
}
