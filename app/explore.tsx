import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../src/components/BottomNavigation';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

const modules = [
  {
    id: 'dynamics',
    title: 'Dinámicas',
    subtitle: 'Promociones, trivias, encuestas y activaciones.',
    icon: 'sparkles-outline' as const,
    route: '/dynamics' as const,
    available: true,
  },
  {
    id: 'weather',
    title: 'Clima',
    subtitle: 'Detroit y mercados destacados de LA Z.',
    icon: 'partly-sunny-outline' as const,
    route: '/weather' as const,
    available: true,
  },
  {
    id: 'programs',
    title: 'Programas',
    subtitle: 'Shows, hosts y programación.',
    icon: 'mic-outline' as const,
    available: false,
  },
  {
    id: 'events',
    title: 'Eventos',
    subtitle: 'Fechas y experiencias de la comunidad.',
    icon: 'calendar-outline' as const,
    available: false,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>
          Explorar
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Descubre las experiencias disponibles en LA Z.
        </Text>

        <View style={styles.grid}>
          {modules.map((item) => (
            <Pressable
              key={item.id}
              disabled={!item.available}
              onPress={() => item.route && router.push(item.route)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: !item.available ? 0.48 : pressed ? 0.76 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Ionicons
                  color={item.available ? colors.red : colors.gray}
                  name={item.icon}
                  size={28}
                />
              </View>
              <Text style={[styles.cardTitle, { color: colors.white }]}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                {item.subtitle}
              </Text>
              {!item.available ? (
                <Text style={[styles.comingSoon, { color: colors.red }]}>
                  PRÓXIMAMENTE
                </Text>
              ) : null}
            </Pressable>
          ))}
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
    paddingBottom: 160,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 36,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    gap: 14,
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: 150,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 25,
    marginTop: 14,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  comingSoon: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 12,
  },
});
