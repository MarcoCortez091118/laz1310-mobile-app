import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../src/api/client';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import {
  getWeatherDetail,
  getWeatherLocations,
  WeatherLocationSummary,
  WeatherResponse,
} from '../../src/features/weather/api';
import {
  conditionIcon,
  conditionLabel,
  displayTemperature,
  localTimeLabel,
} from '../../src/features/weather/presentation';
import { useWeatherUnit } from '../../src/features/weather/WeatherUnitProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

interface WeatherCardData {
  location: WeatherLocationSummary;
  weather: WeatherResponse | null;
}

function errorCopy(error: unknown) {
  if (error instanceof ApiError && error.status === 503) {
    return 'El clima no está disponible temporalmente. Intenta nuevamente en unos momentos.';
  }

  return 'No pudimos cargar el clima. Revisa tu conexión e intenta nuevamente.';
}

export default function WeatherListScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { unit, setUnit } = useWeatherUnit();
  const [cards, setCards] = useState<WeatherCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const locations = await getWeatherLocations();
      const values = await Promise.all(
        locations.map(async (location) => {
          try {
            return {
              location,
              weather: await getWeatherDetail(location.id),
            };
          } catch {
            return { location, weather: null };
          }
        }),
      );

      setCards(values);
    } catch (requestError) {
      setCards([]);
      setError(errorCopy(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
              Condiciones actuales desde LA Z API
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
                    { color: unit === value ? '#FEFEFE' : colors.muted },
                  ]}
                >
                  °{value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              Consultando condiciones actuales…
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="cloud-offline-outline" size={30} />
            <Text style={[styles.errorText, { color: colors.white }]}>
              {error}
            </Text>
            <PrimaryButton label="Reintentar" onPress={() => void load()} secondary />
          </View>
        ) : null}

        {!loading && !error ? (
          <View style={styles.list}>
            {cards.map(({ location, weather }) => {
              const current = weather?.current;
              const icon = current
                ? conditionIcon(current.conditionCode, current.isDay)
                : 'cloud-offline-outline';

              return (
                <Pressable
                  accessibilityLabel={'Ver clima de ' + location.city}
                  accessibilityRole="button"
                  key={location.id}
                  onPress={() =>
                    router.push({
                      pathname: '/weather/[city]',
                      params: { city: location.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor:
                        current?.isDay && current.conditionCode === 'clear'
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
                      <Text style={styles.cityTitle}>{location.city}</Text>
                      {location.primary ? (
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
                      {localTimeLabel(location.timezone)}
                    </Text>
                    <Text style={styles.condition}>
                      {current
                        ? conditionLabel(current.conditionCode)
                        : 'Temporalmente no disponible'}
                    </Text>
                    {weather?.stale ? (
                      <Text style={styles.stale}>DATOS EN CACHÉ</Text>
                    ) : null}
                  </View>

                  <View style={styles.tempColumn}>
                    <Text style={styles.temperature}>
                      {current
                        ? displayTemperature(current.temperatureC, unit) + '°'
                        : '—'}
                    </Text>
                    <Text style={styles.highLow}>
                      {current
                        ? 'H:' +
                          displayTemperature(current.highC, unit) +
                          '° L:' +
                          displayTemperature(current.lowC, unit) +
                          '°'
                        : 'Sin datos'}
                    </Text>
                  </View>

                  <Ionicons
                    color="rgba(254,254,254,0.88)"
                    name={icon}
                    size={30}
                    style={styles.weatherIcon}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {!loading && !error && cards.length === 0 ? (
          <Text style={[styles.footer, { color: colors.muted }]}>
            No hay ciudades configuradas en LA Z API.
          </Text>
        ) : (
          <Text style={[styles.footer, { color: colors.muted }]}>
            Selecciona una ciudad para ver el pronóstico completo.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  headingCopy: { flex: 1 },
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
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 72,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  errorCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 14,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
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
    color: '#FEFEFE',
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
  stale: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 7,
    letterSpacing: 0.8,
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
