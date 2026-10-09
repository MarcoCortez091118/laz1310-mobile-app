import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { V3Screen, v3 } from '../src/components/v3/V3Shell';
import { useContentVersion } from '../src/features/content/ContentVersionProvider';
import { DynamicCampaign, getDynamics } from '../src/features/dynamics/api';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

export default function PrizesScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const english = language === 'en';
  const { releaseId, refresh } = useContentVersion();
  const [campaigns, setCampaigns] = useState<DynamicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const version = await refresh();
      const result = await getDynamics(version?.releaseId ?? releaseId ?? undefined);
      setCampaigns(result.items.filter((x) => x.status === 'active'));
    } catch {
      setCampaigns([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [refresh, releaseId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const featured = campaigns.find((c) => c.featured) ?? campaigns[0];

  return (
    <V3Screen title={english ? 'PRIZES' : 'PREMIOS'}>
      <View style={styles.banner}>
        {featured?.imageUrl ? (
          <>
            <Image source={{ uri: featured.imageUrl }} resizeMode="cover" style={styles.bannerArtwork} />
            <View style={styles.bannerShade}>
              <Text style={styles.bannerTitle}>
                {english ? 'REGISTER HERE' : 'REGÍSTRATE AQUÍ'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {english ? 'TO WIN PRIZES' : 'PARA GANAR PREMIOS'}
              </Text>
            </View>
          </>
        ) : (
          <Image
            accessible
            accessibilityLabel={english ? 'LA Z Detroit promotional ticket giveaway poster' : 'Anuncio de LA Z Detroit: Regístrate para ganar boletos'}
            source={require('../assets/brand/v3-giveaway-banner.webp')}
            resizeMode="cover"
            style={styles.bannerArtwork}
          />
        )}
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={v3.red} size="large" />
          <Text style={styles.stateCopy}>{english ? 'Loading available giveaways…' : 'Consultando premios disponibles…'}</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.state}>
          <Text style={styles.stateCopy}>{english ? 'Could not load published prizes.' : 'No pudimos cargar los premios publicados.'}</Text>
          <Pressable onPress={() => void load()} accessibilityRole="button" style={styles.cta}>
            <Text style={styles.ctaLabel}>{english ? 'TRY AGAIN' : 'REINTENTAR'}</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && !featured ? (
        <View style={styles.state}>
          <Ionicons name="ticket-outline" size={32} color={v3.red} />
          <Text style={styles.stateCopy}>{english ? 'There are no active giveaways right now.' : 'Por ahora no hay premios activos.'}</Text>
        </View>
      ) : null}

      {!loading && !error && featured ? (
        <View style={styles.formPreview}>
          <Text style={styles.formHeadline}>{featured.title}</Text>
          <Text style={styles.helpText}>{featured.context || featured.description}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={english ? 'Open the verified prize entry form' : 'Abrir formulario oficial para participar'}
            onPress={() => router.push(`/dynamics/${featured.id}/participate`)}
            style={styles.decorativeFields}
          >
            <View style={styles.fieldPair}>
              <View style={styles.fieldBox}><Text style={styles.fieldCopy}>{english ? 'First name' : 'Nombre'}</Text></View>
              <View style={styles.fieldBox}><Text style={styles.fieldCopy}>{english ? 'Last name' : 'Apellido'}</Text></View>
            </View>
            <View style={styles.fieldBox}><Text style={styles.fieldCopy}>{english ? 'Phone number' : 'Teléfono'}</Text></View>
            <View style={styles.fieldBox}><Text style={styles.fieldCopy}>{english ? 'Email' : 'Correo'}</Text></View>
          </Pressable>
          <Text style={styles.formHint}>
            {english
              ? 'Tap Register to complete the verified form and agree to the campaign terms.'
              : 'Toca Registrarse para completar el formulario oficial y aceptar las condiciones de la dinámica.'}
          </Text>
          <Pressable
            accessibilityLabel={english ? 'Register for this prize' : 'Registrarse para este premio'}
            accessibilityRole="button"
            onPress={() => router.push(`/dynamics/${featured.id}/participate`)}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.ctaLabel}>{english ? 'REGISTER' : 'REGISTRARSE'}</Text>
          </Pressable>
        </View>
      ) : null}

      {campaigns.length > 1 ? (
        <View style={styles.otherCampaigns}>
          <Text style={styles.heading}>{english ? 'MORE GIVEAWAYS' : 'MÁS PREMIOS'}</Text>
          {campaigns.filter((x) => x.id !== featured?.id).map((campaign) => (
            <Pressable key={campaign.id} accessibilityRole="button" onPress={() => router.push(`/dynamics/${campaign.id}/participate`)} style={styles.campaign}>
              <Text style={styles.campaignTitle}>{campaign.title}</Text>
              <Ionicons name="chevron-forward" color={v3.white} size={22} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  banner: { minHeight: 150, borderRadius: 17, overflow: 'hidden', backgroundColor: '#185083', justifyContent: 'flex-end', marginBottom: 16 },
  bannerArtwork: { top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' },
  bannerShade: { padding: 20, minHeight: 144, backgroundColor: 'rgba(0,0,0,0.31)', justifyContent: 'center' },
  bannerTitle: { color: '#FFB14C', fontFamily: fonts.displayBlack, fontSize: 34, lineHeight: 35, letterSpacing: 1 },
  bannerSubtitle: { color: v3.white, fontFamily: fonts.displayBlack, fontSize: 24, lineHeight: 26 },
  state: { alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 35, paddingVertical: 22 },
  stateCopy: { color: v3.white, fontFamily: fonts.bodyMedium, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  formPreview: { gap: 12, marginTop: 8, paddingBottom: 18 },
  formHeadline: { fontFamily: fonts.displayExtraBold, fontSize: 24, color: v3.white, textAlign: 'center' },
  helpText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: '#ECECEC', textAlign: 'center' },
  decorativeFields: { gap: 13, marginTop: 5 },
  fieldPair: { flexDirection: 'row', gap: 12 },
  fieldBox: { backgroundColor: 'rgba(232,232,232,0.82)', minHeight: 46, borderRadius: 45, flex: 1, paddingHorizontal: 18, justifyContent: 'center' },
  fieldCopy: { fontFamily: fonts.body, color: '#606060', fontSize: 14 },
  formHint: { fontFamily: fonts.body, color: '#E3DADA', textAlign: 'center', fontSize: 12, lineHeight: 18 },
  cta: { minHeight: 50, borderRadius: 40, backgroundColor: v3.red, alignItems: 'center', justifyContent: 'center', marginTop: 7, paddingHorizontal: 16 },
  ctaLabel: { color: v3.white, fontFamily: fonts.displayBlack, fontSize: 23, textAlign: 'center' },
  otherCampaigns: { marginTop: 20, gap: 12 },
  heading: { fontFamily: fonts.displayBlack, fontSize: 24, color: v3.white },
  campaign: { minHeight: 63, borderRadius: 12, backgroundColor: '#2C1111', padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  campaignTitle: { fontFamily: fonts.bodySemiBold, color: v3.white, fontSize: 15, flexShrink: 1 },
});
