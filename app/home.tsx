import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../src/components/BottomNavigation';
import { BrandLogo } from '../src/components/BrandLogo';
import { LiveBadge } from '../src/components/LiveBadge';
import { LiveRadioCard } from '../src/components/LiveRadioCard';
import { ProgramCard } from '../src/components/ProgramCard';
import { PromoHero } from '../src/components/PromoHero';
import { colors, fonts, spacing } from '../src/theme/tokens';

const categories = ['Todo', 'Shows', 'Noticias', 'Eventos', 'Música'] as const;

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <BrandLogo width={118} />
            <Text style={styles.location}>DETROIT, MI</Text>
          </View>

          <View style={styles.headerActions}>
            <LiveBadge compact />
            <View style={styles.bell}>
              <Ionicons
                color={colors.white}
                name="notifications-outline"
                size={20}
              />
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.categories}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category, index) => (
            <View
              key={category}
              style={[
                styles.category,
                index === 0 && styles.categoryActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  index === 0 && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </View>
          ))}
        </ScrollView>

        <PromoHero />
        <LiveRadioCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROGRAMAS</Text>
          <Text style={styles.seeAll}>Ver todos →</Text>
        </View>

        <View style={styles.programs}>
          <ProgramCard
            schedule="Lun – Vie · 6:00 – 11:00 am"
            title="EL BUENO, LA MALA Y EL FEO"
          />
          <ProgramCard
            schedule="Lun – Vie · 11:00 am – 3:00 pm"
            title="ADRIÁN ESCOBEDO"
          />
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.black,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: 190,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 78,
  },
  brandBlock: {
    alignItems: 'flex-start',
  },
  location: {
    color: colors.gray,
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.5,
    marginLeft: 4,
    marginTop: -8,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bell: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  categories: {
    gap: 10,
    paddingRight: spacing.md,
  },
  category: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  categoryActive: {
    backgroundColor: colors.red,
  },
  categoryText: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontFamily: fonts.bodyBold,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.white,
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
  },
  seeAll: {
    color: colors.red,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  programs: {
    flexDirection: 'row',
    gap: 14,
  },
});
