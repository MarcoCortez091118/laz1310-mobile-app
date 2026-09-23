import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../src/components/ScreenHeader';
import { weatherCities } from '../../src/features/weather/data';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

type Unit = 'F' | 'C';

function convert(value: number, unit: Unit) {
  if (unit === 'F') {
    return Math.round(value);
  }

  return Math.round((value - 32) * (5 / 9));
}

export default function WeatherListScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [unit, setUnit] = useState<Unit>('F');

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Clima" />

        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={[styles.title, { color: colors.white }]}>
              Mercados de LA Z
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Condiciones actuales
            </Text>
          </View>

          <View
            style={[
              styles.unitControl,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            {(['F', 'C'] as const).map((value) => (
              <Pressable
                key={value}
                onPress={() => setUnit(value)}
                style={[
                  styles.unitButton,
                  unit === value && { backgroundColor: colors.red },
                ]}
              >
                <Text
                  style={[
                    styles.unitText,
                    {
                      color:
                        unit === value ? '#FEFEFE' : colors.muted,
                    },
                  ]}
                >
                  °{value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.list}>
          {weatherCities.map((city) => (
            <Pressable
              accessibilityLabel={`Ver clima de ${city.city}`}
              accessibilityRole="button"
              key={city.id}
              onPress={() =>
                router.push({
                  pathname: '/weather/[city]',
                  params: { city: city.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor:
                    city.conditionIcon === 'sunny'
                      ? '#153B5A'
                      : colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <View style={styles.cardGlow} />
              <View style={styles.cityCopy}>
                <View style={styles.cityTitleRow}>
                  <Text style={[styles.cityTitle, { color: '#FEFEFE' }]}>
                    {city.city}
                  </Text>
                  {city.primary ? (
                    <View
                      style={[
                        styles.primaryBadge,
                        { backgroundColor: colors.red },
                      ]}
                    >
                      <Text style={styles.primaryBadgeText}>PRINCIPAL</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.cityTime}>
                  {city.localTimeLabel}
                </Text>
                <Text style={styles.condition}>{city.condition}</Text>
              </View>

              <View style={styles.tempColumn}>
                <Text style={styles.temperature}>
                  {convert(city.temperature, unit)}°
                </Text>
                <Text style={styles.highLow}>
                  H:{convert(city.high, unit)}° L:{convert(city.low, unit)}°
                </Text>
              </View>

              <Ionicons
                color="rgba(254,254,254,0.88)"
                name={
                  city.conditionIcon === 'sunny'
                    ? 'sunny-outline'
                    : 'cloud-outline'
                }
                size={30}
                style={styles.weatherIcon}
              />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.muted }]}>
          Selecciona una ciudad para ver el pronóstico completo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  headingCopy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  unitControl: {
    borderRadius: radii.md,
    flexDirection: 'row',
    padding: 3,
  },
  unitButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  unitText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  list: {
    gap: 14,
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 134,
    overflow: 'hidden',
    padding: spacing.md,
  },
  cardGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 120,
    height: 180,
    position: 'absolute',
    right: -32,
    top: -82,
    width: 180,
  },
  cityCopy: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 110,
  },
  cityTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cityTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
  },
  primaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  primaryBadgeText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 7,
    letterSpacing: 0.8,
  },
  cityTime: {
    color: 'rgba(254,254,254,0.72)',
    fontFamily: fonts.body,
    fontSize: 11,
  },
  condition: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  tempColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'absolute',
    right: 16,
    top: 12,
  },
  temperature: {
    color: '#FEFEFE',
    fontFamily: fonts.displayBold,
    fontSize: 50,
    lineHeight: 52,
  },
  highLow: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    marginTop: 46,
  },
  weatherIcon: {
    bottom: 15,
    position: 'absolute',
    right: 16,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
