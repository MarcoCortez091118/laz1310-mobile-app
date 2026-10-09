import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { VinylArtwork } from '../src/components/VinylArtwork';
import { V3_COLORS, V3Page } from '../src/components/v3/V3Layout';
import { ADVERTISING_EMAIL, CONTACT_CHANNELS } from '../src/config/contact';
import { shareLiveRadio } from '../src/config/share';
import { openContactChannel } from '../src/features/contact/links';
import { useRadio } from '../src/features/radio/useRadio';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

const social = [
  { id: 'facebook', icon: 'logo-facebook', color: '#3468AA' },
  { id: 'instagram', icon: 'logo-instagram', color: '#A831B9' },
  { id: 'tiktok', icon: 'logo-tiktok', color: '#242424' },
  { id: 'whatsapp', icon: 'logo-whatsapp', color: '#37C847' },
  { id: 'email', icon: 'mail', color: '#D30015' },
] as const;

export default function RadioV3() {
  const { language } = useLanguage();
  const en = language === 'en';
  const { state, toggle, retry, error } = useRadio();
  const { width, height } = useWindowDimensions();
  const [sharing, setSharing] = useState(false);
  const playing = state === 'playing';
  const loading = state === 'connecting' || state === 'reconnecting';
  const vinylSize = Math.min(292, width - 72, Math.max(205, height * 0.34));

  async function socialPress(id: typeof social[number]['id']) {
    if (id === 'tiktok') return; // No official TikTok URL has been approved.
    if (id === 'email') {
      try { await Linking.openURL(`mailto:${ADVERTISING_EMAIL}`); }
      catch { Alert.alert(en ? 'Mail app unavailable' : 'No hay aplicación de correo', ADVERTISING_EMAIL); }
      return;
    }
    const destination = CONTACT_CHANNELS.find(channel => channel.id === id);
    if (destination) await openContactChannel(destination, language);
  }

  async function share() {
    if (sharing) return;
    setSharing(true);
    try { await shareLiveRadio(language); }
    catch { Alert.alert(en ? 'Cannot share' : 'No se pudo compartir'); }
    finally { setSharing(false); }
  }

  return (
    <V3Page title={en ? 'LIVE RADIO' : 'RADIO EN VIVO'} showRadioShortcut={false}>
      <View style={styles.player}>
        <VinylArtwork size={vinylSize} playing={playing} />
        <View style={styles.equalizer} pointerEvents="none">
          {Array.from({ length: 23 }, (_, i) => <View key={i} style={[styles.dot, { opacity: (i % 3 + 1) / 4 }]} />)}
        </View>
        <Text style={styles.eyebrow}>
          {loading ? (en ? 'Connecting live…' : 'Conectando en vivo…') : playing ? (en ? 'Listening Live' : 'Escuchando en Vivo') : (en ? 'Live Broadcast' : 'Radio en Vivo')}
        </Text>
        <Text numberOfLines={2} adjustsFontSizeToFit style={styles.station}>{en ? 'LA Z DETROIT LIVE' : 'LA Z DETROIT EN VIVO'}</Text>
        <Text style={styles.slogan}>{en ? 'Marking Territory' : 'Marcando Territorio'}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? (en ? 'Pause radio' : 'Pausar radio') : en ? 'Play live radio' : 'Reproducir radio en vivo'}
          disabled={loading}
          onPress={state === 'error' ? retry : toggle}
          style={({ pressed }) => [styles.playButton, { opacity: loading ? 0.55 : pressed ? 0.8 : 1 }]}
        >
          {loading ? <ActivityIndicator color={V3_COLORS.white} size="large" /> : <Ionicons color={V3_COLORS.white} name={playing ? 'pause' : 'play'} size={51} />}
        </Pressable>
        {error && state === 'error' ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.social}>
        {social.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ disabled: item.id === 'tiktok' }}
            accessibilityLabel={item.id === 'tiktok' ? (en ? 'TikTok unavailable' : 'TikTok no disponible') : item.id}
            disabled={item.id === 'tiktok'}
            onPress={() => void socialPress(item.id)}
            style={[styles.socialCircle, { backgroundColor: item.color, opacity: item.id === 'tiktok' ? 0.46 : 1 }]}
          >
            <Ionicons name={item.icon} color={V3_COLORS.white} size={29} />
          </Pressable>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => void share()} style={styles.shareMore}>
        <Ionicons name="share-social-outline" color={V3_COLORS.white} size={17} />
        <Text style={styles.shareLabel}>{en ? 'SHARE LA Z DETROIT' : 'COMPARTIR LA RADIO'}</Text>
      </Pressable>
    </V3Page>
  );
}

const styles = StyleSheet.create({
  player: { alignItems: 'center', paddingTop: 24 },
  equalizer: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 22, marginBottom: 20 },
  dot: { height: 5, width: 5, borderRadius: 4, backgroundColor: V3_COLORS.red },
  eyebrow: { color: V3_COLORS.red, fontFamily: fonts.displayBlack, fontSize: 21, letterSpacing: 0.8 },
  station: { marginTop: 3, fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 33, lineHeight: 37, letterSpacing: 1.2, textAlign: 'center' },
  slogan: { marginTop: 4, fontFamily: fonts.bodySemiBold, color: '#C9C9C9', fontSize: 16 },
  playButton: { backgroundColor: V3_COLORS.red, minHeight: 80, width: 118, borderRadius: 50, marginTop: 26, alignItems: 'center', justifyContent: 'center' },
  error: { marginTop: 14, color: '#FFBDC0', fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
  social: { flexDirection: 'row', justifyContent: 'space-between', gap: 5, alignItems: 'center', marginTop: 33, paddingHorizontal: 1 },
  socialCircle: { height: 51, width: 51, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  shareMore: { flexDirection: 'row', minHeight: 48, gap: 8, alignItems: 'center', justifyContent: 'center' },
  shareLabel: { color: V3_COLORS.white, fontFamily: fonts.bodyMedium, fontSize: 11 },
});
