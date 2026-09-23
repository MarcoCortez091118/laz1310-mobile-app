import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Link,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import * as Linking from 'expo-linking';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { getDynamicCampaign } from '../../src/features/dynamics/data';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function DynamicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const campaign = getDynamicCampaign(id);
  const { colors } = useAppTheme();

  const isExternal = campaign.participationType === 'external_url';
  const canOpenExternal = isExternal && Boolean(campaign.participationUrl);

  const handlePrimaryAction = () => {
    if (campaign.participationType === 'form') {
      router.push({
        pathname: '/dynamics/[id]/participate',
        params: { id: campaign.id },
      });
      return;
    }

    if (campaign.participationUrl) {
      void Linking.openURL(campaign.participationUrl);
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

        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.heroGlow,
              { backgroundColor: colors.red },
            ]}
          />
          <Text style={[styles.artLabel, { color: colors.red }]}>
            {campaign.artworkLabel}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.white }]}>
            {campaign.title}
          </Text>
          <Text style={[styles.brand, { color: colors.white }]}>
            LA Z 1310
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.white }]}>
          {campaign.title}
        </Text>
        <Text style={[styles.deadline, { color: colors.red }]}>
          {campaign.deadline}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons color={colors.red} name="radio-outline" size={22} />
            <View style={styles.metaCopy}>
              <Text style={[styles.metaLabel, { color: colors.muted }]}>
                Organiza
              </Text>
              <Text style={[styles.metaValue, { color: colors.white }]}>
                LA Z 1310
              </Text>
            </View>
          </View>

          <View style={styles.meta}>
            <Ionicons
              color={colors.red}
              name={isExternal ? 'open-outline' : 'document-text-outline'}
              size={22}
            />
            <View style={styles.metaCopy}>
              <Text style={[styles.metaLabel, { color: colors.muted }]}>
                Participación
              </Text>
              <Text style={[styles.metaValue, { color: colors.white }]}>
                {isExternal ? 'URL externa' : 'Formulario'}
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

        {isExternal ? (
          <View
            style={[
              styles.externalCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="globe-outline" size={28} />
            <View style={styles.externalCopy}>
              <Text style={[styles.externalTitle, { color: colors.white }]}>
                Participación externa
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.externalUrl, { color: colors.muted }]}
              >
                {campaign.participationUrl ??
                  'El backend proporcionará la URL real de esta dinámica.'}
              </Text>
            </View>
          </View>
        ) : null}

        <PrimaryButton
          disabled={isExternal && !canOpenExternal}
          label={
            isExternal
              ? canOpenExternal
                ? 'Abrir enlace'
                : 'Enlace pendiente'
              : 'Abrir formulario'
          }
          onPress={handlePrimaryAction}
        />

        {isExternal && !campaign.participationUrl ? (
          <Text style={[styles.pending, { color: colors.muted }]}>
            No usamos una URL ficticia. Este CTA se habilitará cuando el
            contrato de Dinámicas entregue participationUrl.
          </Text>
        ) : null}

        <Link href="/dynamics" asChild>
          <Pressable style={styles.backToList}>
            <Text style={[styles.backToListText, { color: colors.red }]}>
              Ver todas las dinámicas
            </Text>
          </Pressable>
        </Link>
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
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  hero: {
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 300,
    marginTop: 8,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  heroGlow: {
    borderRadius: 180,
    height: 280,
    opacity: 0.18,
    position: 'absolute',
    right: -80,
    top: -70,
    width: 280,
  },
  artLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  heroTitle: {
    bottom: 56,
    fontFamily: fonts.displayBlack,
    fontSize: 46,
    left: 24,
    lineHeight: 44,
    position: 'absolute',
    right: 24,
  },
  brand: {
    bottom: 24,
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
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  metaCopy: {
    marginLeft: 8,
  },
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
  externalCard: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 92,
    padding: spacing.md,
  },
  externalCopy: {
    flex: 1,
    marginLeft: 12,
  },
  externalTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  externalUrl: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  pending: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
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
