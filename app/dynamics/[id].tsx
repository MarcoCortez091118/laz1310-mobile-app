import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
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
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import {
  DynamicCampaign,
  getDynamic,
} from '../../src/features/dynamics/api';
import { dynamicDeadline } from '../../src/features/dynamics/presentation';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function errorCopy(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'Esta dinámica ya no está disponible en la publicación actual.';
  }

  return 'No pudimos cargar esta dinámica.';
}

export default function DynamicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useAppTheme();
  const [campaign, setCampaign] = useState<DynamicCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Falta el identificador de la dinámica.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getDynamic(id);
      setCampaign(result.item);
    } catch (requestError) {
      setCampaign(null);
      setError(errorCopy(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePrimaryAction = () => {
    if (!campaign || campaign.status !== 'active') {
      return;
    }

    if (campaign.participation.type === 'form') {
      router.push({
        pathname: '/dynamics/[id]/participate',
        params: { id: campaign.id },
      });
      return;
    }

    if (campaign.participation.url) {
      void Linking.openURL(campaign.participation.url);
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Dinámica" />

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              Cargando dinámica…
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
            <Ionicons color={colors.red} name="alert-circle-outline" size={32} />
            <Text style={[styles.errorText, { color: colors.white }]}>{error}</Text>
            <PrimaryButton label="Reintentar" onPress={() => void load()} secondary />
          </View>
        ) : null}

        {!loading && campaign ? (
          <>
            <View
              style={[
                styles.hero,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Image source={{ uri: campaign.imageUrl }} style={styles.heroImage} />
              <View style={styles.heroScrim} />
              <Text style={[styles.artLabel, { color: colors.red }]}>
                {campaign.artworkLabel}
              </Text>
              <Text style={styles.heroTitle}>{campaign.title}</Text>
              <Text style={styles.brand}>{campaign.context}</Text>
            </View>

            <Text style={[styles.title, { color: colors.white }]}>
              {campaign.title}
            </Text>
            <Text style={[styles.deadline, { color: colors.red }]}>
              {dynamicDeadline(campaign.endsAt, campaign.timezone)}
            </Text>

            <Text style={[styles.description, { color: colors.muted }]}>
              {campaign.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <Ionicons color={colors.red} name="radio-outline" size={22} />
                <View style={styles.metaCopy}>
                  <Text style={[styles.metaLabel, { color: colors.muted }]}>
                    Contexto
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.white }]}>
                    {campaign.context}
                  </Text>
                </View>
              </View>

              <View style={styles.meta}>
                <Ionicons
                  color={colors.red}
                  name={
                    campaign.participation.type === 'external_url'
                      ? 'open-outline'
                      : 'document-text-outline'
                  }
                  size={22}
                />
                <View style={styles.metaCopy}>
                  <Text style={[styles.metaLabel, { color: colors.muted }]}>
                    Participación
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.white }]}>
                    {campaign.participation.type === 'external_url'
                      ? 'URL externa'
                      : 'Formulario'}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.instructions,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                Cómo participar
              </Text>
              <Text style={[styles.body, { color: colors.muted }]}>
                {campaign.instructions}
              </Text>
            </View>

            {campaign.status !== 'active' ? (
              <View
                style={[
                  styles.closedCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons color={colors.red} name="lock-closed-outline" size={22} />
                <Text style={[styles.closedText, { color: colors.white }]}>
                  Esta dinámica está cerrada o todavía no abre.
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              disabled={
                campaign.status !== 'active' ||
                (campaign.participation.type === 'external_url' &&
                  !campaign.participation.url)
              }
              label={
                campaign.status !== 'active'
                  ? 'Dinámica cerrada'
                  : campaign.participation.type === 'external_url'
                    ? 'Abrir enlace'
                    : 'Abrir formulario'
              }
              onPress={handlePrimaryAction}
            />

            <View style={styles.legalRow}>
              <Pressable onPress={() => void Linking.openURL(campaign.termsUrl)}>
                <Text style={[styles.legal, { color: colors.red }]}>
                  Bases y condiciones
                </Text>
              </Pressable>
              <Pressable onPress={() => void Linking.openURL(campaign.privacyUrl)}>
                <Text style={[styles.legal, { color: colors.red }]}>
                  Privacidad
                </Text>
              </Pressable>
            </View>

            <Link href="/dynamics" asChild>
              <Pressable style={styles.backToList}>
                <Text style={[styles.backToListText, { color: colors.red }]}>
                  Ver todas las dinámicas
                </Text>
              </Pressable>
            </Link>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    gap: 14,
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 100,
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
  hero: {
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 300,
    marginTop: 8,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  heroImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  heroScrim: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(5,1,1,0.62)',
  },
  artLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  heroTitle: {
    bottom: 56,
    color: '#FEFEFE',
    fontFamily: fonts.displayBlack,
    fontSize: 46,
    left: 24,
    lineHeight: 44,
    position: 'absolute',
    right: 24,
  },
  brand: {
    bottom: 24,
    color: '#FEFEFE',
    fontFamily: fonts.displayBold,
    fontSize: 18,
    left: 24,
    position: 'absolute',
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 34,
  },
  deadline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  metaCopy: { marginLeft: 8 },
  metaLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
  },
  metaValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginTop: 2,
  },
  instructions: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  closedCard: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
  },
  closedText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legal: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
  backToList: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToListText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
});
