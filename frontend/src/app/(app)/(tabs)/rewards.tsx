import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/mimo/decorations';
import { MimoCharacter } from '@/components/mimo/mimo-bear';
import { MimoPet } from '@/components/mimo/mimo-pet';
import { SparksPill } from '@/components/mimo/sparks-pill';
import { HandFonts, Palette } from '@/constants/theme';
import { SPARKS_PER_MINUTE, usePet } from '@/state/pet';
import { DAILY_GIFT, SHOP, type ShopItem } from '@/state/shop';

/** Where sparks earned from phone-free time get spent. */
export default function RewardsScreen() {
  const { message } = usePet();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards</Text>
          <SparksPill />
        </View>

        <DailyGift />
        <DressingRoom />
        {message && <Text style={styles.message}>{message}</Text>}

        <Text style={styles.sectionTitle}>Shop</Text>
        <View style={styles.grid}>
          {SHOP.map((item) => (
            <ShopCard key={item.id} item={item} />
          ))}
        </View>

        <YourTreats />
        <HowToEarn />
      </ScrollView>
    </SafeAreaView>
  );
}

function DailyGift() {
  const { giftAvailable, claimGift, name } = usePet();

  return (
    <View style={[styles.card, styles.giftCard]}>
      <View style={styles.giftIcon}>
        <Sparkle size={22} color={giftAvailable ? Palette.white : Palette.muted} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>Daily hello</Text>
        <Text style={styles.hint}>
          {giftAvailable ? `${name} saved you +${DAILY_GIFT} sparks today.` : 'Claimed! Come back tomorrow for more.'}
        </Text>
      </View>
      <Pressable
        onPress={claimGift}
        disabled={!giftAvailable}
        style={({ pressed }) => [styles.smallButton, !giftAvailable && styles.smallButtonOff, pressed && styles.pressed]}>
        <Text style={[styles.smallButtonText, !giftAvailable && styles.smallButtonTextOff]}>
          {giftAvailable ? 'Claim' : 'Done'}
        </Text>
      </Pressable>
    </View>
  );
}

function DressingRoom() {
  const { equipped, equipItem, name } = usePet();
  const item = SHOP.find((i) => i.id === equipped);

  return (
    <View style={[styles.card, styles.dressing]}>
      <View style={styles.stage}>
        <MimoPet size={130} mood="joyful" />
      </View>
      <Text style={styles.cardTitle}>{item ? `${name} is wearing the ${item.name}` : `${name} isn't wearing anything yet`}</Text>
      {item && (
        <Pressable onPress={() => equipItem(null)} hitSlop={8}>
          <Text style={styles.link}>Take it off</Text>
        </Pressable>
      )}
    </View>
  );
}

function ShopCard({ item }: { item: ShopItem }) {
  const { owned, equipped, sparks, buyItem, equipItem } = usePet();
  const isOwned = owned.includes(item.id);
  const isWorn = equipped === item.id;
  const short = item.cost - sparks;

  let label = `Buy · ${item.cost}`;
  let onPress = () => buyItem(item.id);
  if (isWorn) {
    label = 'Wearing';
    onPress = () => equipItem(null);
  } else if (isOwned) {
    label = 'Wear';
    onPress = () => equipItem(item.id);
  }

  return (
    <View style={[styles.item, isWorn && styles.itemWorn]}>
      <View style={styles.itemPreview}>
        <MimoCharacter size={70} mood="joyful" accessory={item.id} />
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemBlurb}>{item.blurb}</Text>
      {!isOwned && short > 0 && <Text style={styles.itemShort}>{short} more sparks</Text>}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.itemButton,
          (isOwned || short <= 0) && styles.itemButtonInk,
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.itemButtonText, (isOwned || short <= 0) && styles.itemButtonTextInk]}>{label}</Text>
      </Pressable>
    </View>
  );
}

/** The personal rewards the user promised themselves when setting goals. */
function YourTreats() {
  const { goals } = usePet();
  const treats = goals.filter((g) => g.personalReward);
  if (treats.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Treats you promised yourself</Text>
      {treats.map((g) => {
        const kept = g.week.filter((d) => d === 'done').length;
        return (
          <View key={g.id} style={styles.treat}>
            <Text style={styles.treatName}>{g.personalReward}</Text>
            <Text style={styles.hint}>
              for “{g.title}” · earned {kept}× this week
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function HowToEarn() {
  const { name } = usePet();
  const ways = [
    `${SPARKS_PER_MINUTE} sparks for every phone-free minute with ${name}`,
    'The reward you chose for each goal you keep',
    `+${DAILY_GIFT} sparks for saying hi each day`,
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>How to earn sparks</Text>
      {ways.map((w) => (
        <View key={w} style={styles.way}>
          <Sparkle size={12} />
          <Text style={styles.wayText}>{w}</Text>
        </View>
      ))}
      <Pressable onPress={() => router.push('/focus')} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Text style={styles.ctaText}>Start phone-free time</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: HandFonts.bold,
    fontSize: 34,
    color: Palette.ink,
  },
  message: {
    textAlign: 'center',
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.ink,
  },
  sectionTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 24,
    color: Palette.ink,
  },
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  cardTitle: {
    fontFamily: HandFonts.bold,
    fontSize: 20,
    color: Palette.ink,
  },
  hint: {
    fontFamily: HandFonts.regular,
    fontSize: 15,
    color: Palette.muted,
  },
  link: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
    textDecorationLine: 'underline',
  },

  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  giftIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Palette.ink,
  },
  smallButtonOff: {
    backgroundColor: Palette.shade,
  },
  smallButtonText: {
    fontFamily: HandFonts.bold,
    fontSize: 16,
    color: Palette.white,
  },
  smallButtonTextOff: {
    color: Palette.muted,
  },

  dressing: {
    alignItems: 'center',
  },
  stage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.shade,
    alignItems: 'center',
    justifyContent: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    flexGrow: 1,
    flexBasis: '42%',
    alignItems: 'center',
    gap: 4,
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.ink,
    backgroundColor: Palette.white,
  },
  itemWorn: {
    boxShadow: `4px 4px 0px ${Palette.ink}`,
  },
  itemPreview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  itemBlurb: {
    textAlign: 'center',
    fontFamily: HandFonts.regular,
    fontSize: 14,
    color: Palette.muted,
  },
  itemShort: {
    fontFamily: HandFonts.bold,
    fontSize: 13,
    color: Palette.muted,
  },
  itemButton: {
    marginTop: 6,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.ink,
  },
  itemButtonInk: {
    backgroundColor: Palette.ink,
  },
  itemButtonText: {
    fontFamily: HandFonts.bold,
    fontSize: 15,
    color: Palette.ink,
  },
  itemButtonTextInk: {
    color: Palette.white,
  },

  treat: {
    paddingTop: 8,
    borderTopWidth: 2,
    borderColor: Palette.shade,
    borderStyle: 'dashed',
  },
  treatName: {
    fontFamily: HandFonts.bold,
    fontSize: 17,
    color: Palette.ink,
  },
  way: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wayText: {
    flex: 1,
    fontFamily: HandFonts.regular,
    fontSize: 16,
    color: Palette.ink,
  },
  cta: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: Palette.ink,
  },
  ctaText: {
    fontFamily: HandFonts.bold,
    fontSize: 18,
    color: Palette.white,
  },
});
