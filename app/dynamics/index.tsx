import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../src/api/client';
import { BottomNavigation } from '../../src/components/BottomNavigation';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import {
  DynamicCampaign,
  getDynamics,
} from '../../src/features/dynamics/api';
import { dynamicDeadline } from '../../src/features/dynamics/presentation';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function participationLabel(type: 'form' | 'external_url') {
  return type === 'form' ? 'Formulario' : 'URL externa';
}

function errorCopy(error: unknown) {
  if (error instanceof ApiError && error.status === 503) {
    return 'Dinámicas no está disponible temporalmente.';
  }

  return 'No pudimos cargar las dinámicas publicadas.';
}

export default function DynamicsListScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [items, setItems] = useState<DynamicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDynamics();
      setItems(result.items.filter((item) => item.status === 'active'));
    } catch (requestError) {
      setItems([]);
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
        <ScreenHeader title="Dinámicas" />

        <Text style={[styles.title, { color: colors.white }]}>Disponibles</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Promociones y activaciones publicadas por LA Z.
        </Text>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              Consultando dinámicas…
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
            <Ionicons color={colors.red} name="alert-circle-outline" size={30} />
            <Text style={[styles.errorText, { color: colors.white }]}>
              {error}
            </Text>
            <PrimaryButton label="Reintentar" onPress={() => void load()} secondary />
          </View>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="sparkles-outline" size={30} />
            <Text style={[styles.emptyTitle, { color: colors.white }]}>
              No hay dinámicas activas
            </Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>
              Cuando LA Z publique una nueva promoción aparecerá aquí.
            </Text>
          </View>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                accessibilityLabel={'Abrir dinámica ' + item.title}
                accessibilityRole="button"
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: '/dynamics/[id]',
                    params: { id: item.id },
                  })
                }
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.76 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.artwork,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.artImage} />
                  <View style={styles.artScrim} />
                  <Text style={[styles.artLabel, { color: colors.red }]}>
                    {item.artworkLabel}
                  </Text>
                  <Text style={styles.artBrand}>LA Z</Text>
                </View>

                <View style={styles.copy}>
                  <Text
                    numberOfLines={2}
                    style={[styles.itemTitle, { color: colors.white }]}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.deadline, { color: colors.red }]}>
                    {dynamicDeadline(item.endsAt, item.timezone)}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.context, { color: colors.muted }]}
                  >
                    {item.context}
                  </Text>
                  <Text style={[styles.type, { color: colors.muted }]}>
                    {participationLabel(item.participation.type)}
                  </Text>
                </View>

                <Ionicons
                  color={colors.white}
                  name="chevron-forward"
                  size={22}
                  style={styles.chevron}
                />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 180,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 32,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
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
  emptyCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    marginTop: 12,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    textAlign: 'center',
  },
  list: { marginTop: spacing.lg },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 142,
    paddingVertical: 10,
  },
  artwork: {
    borderRadius: radii.md,
    borderWidth: 1,
    height: 112,
    overflow: 'hidden',
    padding: 12,
    width: 112,
  },
  artImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  artScrim: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(5,1,1,0.58)',
  },
  artLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  artBrand: {
    bottom: 12,
    color: '#FEFEFE',
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    left: 12,
    position: 'absolute',
  },
  copy: {
    flex: 1,
    marginLeft: spacing.md,
    paddingRight: 30,
  },
  itemTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 21,
    lineHeight: 22,
  },
  deadline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginTop: 6,
  },
  context: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 3,
  },
  type: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 3,
  },
  chevron: {
    position: 'absolute',
    right: 2,
  },
});
