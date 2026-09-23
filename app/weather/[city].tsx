import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../src/components/ScreenHeader';
import { getWeatherCity } from '../../src/features/weather/data';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function iconName(condition: 'cloudy' | 'sunny' | 'rain') {
  if (condition === 'rain') {
    return 'rainy-outline' as const;
  }

  if (condition === 'sunny') {
    return 'sunny-outline' as const;
  }

  return 'cloud-outline' as const;
}

export default function WeatherDetailScreen() {
  const { city: cityParam } = useLocalSearchParams<{ city?: string }>();
  const { colors, preference } = useAppTheme();
  const city = getWeatherCity(cityParam);

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safe,
        {
          backgroundColor:
            preference === 'dark'
              ? city.conditionIcon === 'sunny'
                ? '#09243B'
                : '#111820'
              : colors.black,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Clima" />

        <View style={styles.hero}>
          <Text style={[styles.market, { color: colors.red }]}>
            LA Z WEATHER
          </Text>
          <Text style={[styles.city, { color: colors.white }]}>
            {city.city}
          </Text>
          <Text style={[styles.temperature, { color: colors.white }]}>
            {city.temperature}°
          </Text>
          <Text style={[styles.condition, { color: colors.white }]}>
            {city.condition}
          </Text>
          <Text style={[styles.highLow, { color: colors.white }]}>
            H:{city.high}°  L:{city.low}°
          </Text>
        </View>

        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.summary, { color: colors.white }]}>
            {city.summary}
          </Text>
        </View>

        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.muted }]}>
            PRÓXIMAS HORAS
          </Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.hourly}
            showsHorizontalScrollIndicator={false}
          >
            {city.hourly.map((hour) => (
              <View key={hour.label} style={styles.hour}>
                <Text style={[styles.hourLabel, { color: colors.white }]}>
                  {hour.label}
                </Text>
                <Ionicons
                  color={
                    hour.condition === 'sunny'
                      ? colors.red
                      : colors.white
                  }
                  name={iconName(hour.condition)}
                  size={28}
                />
                <Text style={[styles.hourTemp, { color: colors.white }]}>
                  {hour.temperature}°
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.muted }]}>
            PRONÓSTICO · 5 DÍAS
          </Text>

          {city.daily.map((day) => (
            <View
              key={day.label}
              style={[styles.dayRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.day, { color: colors.white }]}>
                {day.label}
              </Text>
              <Ionicons
                color={
                  day.condition === 'sunny'
                    ? colors.red
                    : colors.white
                }
                name={iconName(day.condition)}
                size={26}
              />
              <Text style={[styles.low, { color: colors.muted }]}>
                {day.low}°
              </Text>
              <View style={styles.range}>
                <View
                  style={[
                    styles.rangeFill,
                    { backgroundColor: colors.red },
                  ]}
                />
              </View>
              <Text style={[styles.high, { color: colors.white }]}>
                {day.high}°
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.white }]}>
          Condiciones
        </Text>

        <View style={styles.metrics}>
          {[
            ['HUMEDAD', `${city.humidity}%`],
            ['VIENTO', `${city.windMph} mph`],
            ['PRECIP.', `${city.precipitationMm} mm`],
          ].map(([label, value]) => (
            <View
              key={label}
              style={[
                styles.metric,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.metricLabel, { color: colors.muted }]}>
                {label}
              </Text>
              <Text style={[styles.metricValue, { color: colors.white }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: 14,
    paddingBottom: 140,
    paddingHorizontal: spacing.md,
  },
  hero: {
    alignItems: 'center',
    minHeight: 250,
    paddingTop: spacing.md,
  },
  market: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  city: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    marginTop: 16,
  },
  temperature: {
    fontFamily: fonts.displayBold,
    fontSize: 100,
    lineHeight: 104,
  },
  condition: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
  },
  highLow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginTop: 4,
  },
  glassCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  hourly: {
    gap: 18,
    paddingTop: spacing.md,
  },
  hour: {
    alignItems: 'center',
    gap: 8,
    minWidth: 44,
  },
  hourLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  hourTemp: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  dayRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
  },
  day: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    width: 54,
  },
  low: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    textAlign: 'right',
    width: 42,
  },
  range: {
    backgroundColor: 'rgba(127,127,127,0.24)',
    borderRadius: 999,
    flex: 1,
    height: 5,
  },
  rangeFill: {
    borderRadius: 999,
    height: 5,
    width: '72%',
  },
  high: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    textAlign: 'right',
    width: 42,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 90,
    padding: 12,
  },
  metricLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
  },
  metricValue: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    marginTop: 14,
  },
});
