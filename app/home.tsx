import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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
import { WeatherHeaderBadge } from '../src/components/WeatherHeaderBadge';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, spacing } from '../src/theme/tokens';

const categories = ['Todo', 'Shows', 'Noticias', 'Eventos', 'Música'] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <BrandLogo width={118} />
            <Text style={[styles.location, { color: colors.gray }]}>
              DETROIT, MI
            </Text>
          </View>

          <View style={styles.headerActions}>
            <LiveBadge compact />
            <WeatherHeaderBadge />
            <View
              style={[
                styles.bell,
                { backgroundColor: colors.surfaceElevated },
              ]}
            >
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
                {
                  backgroundColor:
                    index === 0
                      ? colors.red
                      : colors.surfaceElevated,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: index === 0 ? '#FEFEFE' : colors.white },
                  index === 0 && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </View>
          ))}
        </ScrollView>

        <PromoHero onPress={() => router.push('/dynamics')} />
        <LiveRadioCard />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            PROGRAMAS
          </Text>
          <Text style={[styles.seeAll, { color: colors.red }]}>
            Ver todos →
          </Text>
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
    borderRadius: 999,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  categoryText: {
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
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
  },
  seeAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  programs: {
    flexDirection: 'row',
    gap: 14,
  },
});
