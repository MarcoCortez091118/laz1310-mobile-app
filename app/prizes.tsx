import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { V3_COLORS, V3Page } from '../src/components/v3/V3Layout';
import { useContentVersion } from '../src/features/content/ContentVersionProvider';
import { DynamicCampaign, getDynamics } from '../src/features/dynamics/api';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

export default function PrizesV3() {
  const router = useRouter();
  const { language } = useLanguage();
  const en = language === 'en';
  const { releaseId, refresh } = useContentVersion();
  const [campaigns, setCampaigns] = useState<DynamicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const latest = await refresh();
      const result = await getDynamics(latest?.releaseId ?? releaseId ?? undefined);
      setCampaigns(result.items.filter(item => item.status === 'active'));
    } catch {
      setFailed(true);
      setCampaigns([]);
    } finally { setLoading(false); }
  }, [refresh, releaseId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const featured = campaigns.find(c => c.featured) ?? campaigns[0];
  const openEntry = (id: string) => router.push(`/dynamics/${id}/participate`);

  return (
    <V3Page title={en ? 'PRIZES' : 'PREMIOS'}>
      <View style={styles.poster}>
        <Image
          source={require('../assets/brand/v3-tigers-giveaway.webp')}
          resizeMode="cover"
          accessibilityLabel={en ? 'LA Z Detroit register to win tickets' : 'La Z Detroit regístrate para ganar boletos'}
          style={styles.posterArtwork}
        />
      </View>
      {loading && <View style={styles.state}><ActivityIndicator color={V3_COLORS.red} /><Text style={styles.stateText}>{en ? 'Loading prizes…' : 'Cargando premios…'}</Text></View>}
      {!loading && failed && (
        <View style={styles.state}>
          <Text style={styles.stateText}>{en ? 'Prizes are temporarily unavailable.' : 'Los premios no están disponibles temporalmente.'}</Text>
          <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.button}><Text style={styles.buttonText}>{en ? 'RETRY' : 'REINTENTAR'}</Text></Pressable>
        </View>
      )}
      {!loading && !failed && !featured && <View style={styles.state}><Text style={styles.stateText}>{en ? 'No active giveaways right now.' : 'Por ahora no hay premios activos.'}</Text></View>}
      {featured && !loading && !failed && (
        <View style={styles.form}>
          <Text style={styles.title}>{featured.title}</Text>
          <Text style={styles.sub}>{featured.context || featured.description}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={en ? 'Open official registration form' : 'Abrir formulario de registro oficial'}
            onPress={() => openEntry(featured.id)}
            style={styles.formPreview}
          >
            <View style={styles.pair}>
              <View style={styles.field}><Text style={styles.placeholder}>{en ? 'First name' : 'Nombre'}</Text></View>
              <View style={styles.field}><Text style={styles.placeholder}>{en ? 'Last name' : 'Apellido'}</Text></View>
            </View>
            <View style={styles.field}><Text style={styles.placeholder}>{en ? 'Phone number' : 'Teléfono'}</Text></View>
            <View style={styles.field}><Text style={styles.placeholder}>{en ? 'Email' : 'Correo'}</Text></View>
          </Pressable>
          <Text style={styles.disclosure}>{en ? 'The official entry form verifies the campaign, required fields and terms.' : 'El formulario oficial valida la dinámica, los datos solicitados y los términos.'}</Text>
          <Pressable accessibilityRole="button" onPress={() => openEntry(featured.id)} style={styles.button}>
            <Text style={styles.buttonText}>{en ? 'REGISTER' : 'REGISTRARSE'}</Text>
          </Pressable>
        </View>
      )}
      {campaigns.length > 1 && (
        <View style={styles.more}>
          <Text style={styles.moreTitle}>{en ? 'MORE GIVEAWAYS' : 'MÁS PREMIOS'}</Text>
          {campaigns.filter(c => c.id !== featured?.id).map(c => (
            <Pressable key={c.id} accessibilityRole="button" onPress={() => openEntry(c.id)} style={styles.other}>
              <Text style={styles.otherText}>{c.title}</Text>
              <Ionicons name="chevron-forward" color={V3_COLORS.white} size={22} />
            </Pressable>
          ))}
        </View>
      )}
    </V3Page>
  );
}

const styles = StyleSheet.create({
  poster: { minHeight: 160, width: '100%', backgroundColor: '#224968', borderRadius: 18, overflow: 'hidden', marginBottom: 15 },
  posterArtwork: { width: '100%', height: 165 },
  state: { minHeight: 100, gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  stateText: { fontFamily: fonts.bodyMedium, textAlign: 'center', color: V3_COLORS.white, fontSize: 15 },
  form: { gap: 12, paddingBottom: 20 },
  title: { textAlign: 'center', fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 26 },
  sub: { textAlign: 'center', color: V3_COLORS.gray, fontFamily: fonts.body, fontSize: 14 },
  formPreview: { gap: 13 },
  pair: { flexDirection: 'row', gap: 13 },
  field: { backgroundColor: 'rgba(231,231,231,0.85)', borderRadius: 29, paddingHorizontal: 18, flex: 1, justifyContent: 'center', minHeight: 51 },
  placeholder: { fontFamily: fonts.body, color: '#676767', fontSize: 14 },
  disclosure: { fontFamily: fonts.body, color: V3_COLORS.gray, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  button: { backgroundColor: V3_COLORS.red, borderRadius: 32, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 },
  buttonText: { fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 24 },
  more: { gap: 12, marginTop: 22 },
  moreTitle: { fontFamily: fonts.displayBlack, fontSize: 25, color: V3_COLORS.white },
  other: { minHeight: 59, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7, backgroundColor: '#2A090D' },
  otherText: { fontFamily: fonts.bodySemiBold, color: V3_COLORS.white, flex: 1, fontSize: 14 },
});
