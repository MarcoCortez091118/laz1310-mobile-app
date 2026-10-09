import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { VinylArtwork } from '../src/components/VinylArtwork';
import { V3Screen, v3 } from '../src/components/v3/V3Shell';
import { ADVERTISING_EMAIL, CONTACT_CHANNELS } from '../src/config/contact';
import { shareLiveRadio } from '../src/config/share';
import { openContactChannel } from '../src/features/contact/links';
import { useRadio } from '../src/features/radio/useRadio';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';
import { Linking } from 'react-native';

const social = [
  { id: 'facebook', icon: 'logo-facebook', tint: '#3969AD' },
  { id: 'instagram', icon: 'logo-instagram', tint: '#B72AB6' },
  { id: 'tiktok', icon: 'logo-tiktok', tint: '#242424' },
  { id: 'whatsapp', icon: 'logo-whatsapp', tint: '#31C650' },
  { id: 'email', icon: 'mail-outline', tint: '#CB0714' },
] as const;

export default function RadioScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const english = language === 'en';
  const { state, toggle, retry, error } = useRadio();
  const { width, height } = useWindowDimensions();
  const [sharing, setSharing] = useState(false);
  const vinylSize = Math.min(290, Math.max(195, width - 76), Math.max(195, height * 0.36));
  const playing = state === 'playing';
  const busy = state === 'connecting' || state === 'reconnecting';

  async function openSocial(id: typeof social[number]['id']) {
    if (id === 'tiktok') return;
    if (id === 'email') {
      try {
        await Linking.openURL(`mailto:${ADVERTISING_EMAIL}`);
      } catch {
        Alert.alert(english ? 'Email app unavailable' : 'No hay app de correo', ADVERTISING_EMAIL);
      }
      return;
    }
    const channel = CONTACT_CHANNELS.find((item) => item.id === id);
    if (channel) await openContactChannel(channel, language);
  }

  async function share() {
    if (sharing) return;
    setSharing(true);
    try {
      await shareLiveRadio(language);
    } catch {
      Alert.alert(english ? 'Cannot share' : 'No se pudo compartir');
    } finally {
      setSharing(false);
    }
  }

  return (
    <V3Screen title={english ? 'LIVE RADIO' : 'RADIO EN VIVO'} radioShortcut={false}>
      <View style={styles.player}>
        <View style={styles.vinyl}>
          <VinylArtwork playing={playing} size={vinylSize} />
        </View>
        <View style={styles.waveform} accessibilityElementsHidden>
          {Array.from({ length: 23 }, (_, i) => (
            <View key={i} style={[styles.waveDot, { opacity: i % 4 === 0 ? 0.8 : 0.4 }]} />
          ))}
        </View>

        <Text style={styles.liveLabel}>
          {busy
            ? english ? 'Connecting live…' : 'Conectando en vivo…'
            : playing
              ? english ? 'Listening Live' : 'Escuchando en Vivo'
              : english ? 'Live broadcast' : 'Radio en vivo'}
        </Text>
        <Text style={styles.stationTitle}>
          {english ? 'LA Z DETROIT LIVE' : 'LA Z DETROIT EN VIVO'}
        </Text>
        <Text style={styles.slogan}>
          {english ? 'Marking Territory' : 'Marcando Territorio'}
        </Text>

        <Pressable
          accessibilityLabel={playing ? (english ? 'Pause live radio' : 'Pausar radio en vivo') : (english ? 'Play live radio' : 'Reproducir radio en vivo')}
          accessibilityRole="button"
          disabled={busy}
          onPress={state === 'error' ? retry : toggle}
          style={({ pressed }) => [styles.playButton, { opacity: pressed ? 0.75 : busy ? 0.62 : 1 }]}
        >
          {busy ? <ActivityIndicator color={v3.white} size="large" /> : (
            <Ionicons name={playing ? 'pause' : 'play'} color={v3.white} size={47} />
          )}
        </Pressable>
        {state === 'error' && error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.socialStrip}>
        {social.map((item) => (
          <Pressable
            key={item.id}
            disabled={item.id === 'tiktok'}
            accessibilityRole="button"
            accessibilityState={{ disabled: item.id === 'tiktok' }}
            accessibilityLabel={
              item.id === 'tiktok'
                ? (english ? 'TikTok profile coming soon' : 'Perfil de TikTok pendiente')
                : item.id === 'email' ? (english ? 'Email LA Z Detroit' : 'Enviar correo a LA Z Detroit') : item.id
            }
            onPress={() => void openSocial(item.id)}
            style={({ pressed }) => [styles.socialButton, { backgroundColor: item.tint, opacity: item.id === 'tiktok' ? 0.46 : pressed ? 0.75 : 1 }]}
          >
            <Ionicons name={item.icon} size={30} color={v3.white} />
          </Pressable>
        ))}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={english ? 'Share this radio station' : 'Compartir esta estación'} onPress={() => void share()} style={styles.shareSecondary}>
        <Ionicons name="share-social-outline" color={v3.white} size={20} />
        <Text style={styles.shareCopy}>{english ? 'SHARE THIS STATION' : 'COMPARTIR LA RADIO'}</Text>
      </Pressable>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  player: { alignItems: 'center', paddingTop: 12 },
  vinyl: { alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  waveform: { marginTop: 13, marginBottom: 12, flexDirection: 'row', gap: 8, justifyContent: 'center' },
  waveDot: { backgroundColor: v3.red, width: 5, height: 5, borderRadius: 3 },
  liveLabel: { color: v3.red, fontFamily: fonts.displayBlack, fontSize: 22, letterSpacing: 1.1, textAlign: 'center' },
  stationTitle: { color: v3.white, fontFamily: fonts.displayBlack, fontSize: 32, letterSpacing: 1.1, textAlign: 'center', marginTop: 2 },
  slogan: { color: '#D6D0D0', fontFamily: fonts.bodyBold, fontSize: 18, textAlign: 'center', marginTop: 3 },
  playButton: { marginTop: 21, backgroundColor: v3.red, borderRadius: 60, minHeight: 82, width: 115, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#FFD4D6', fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 12 },
  socialStrip: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, alignItems: 'center', marginTop: 33, paddingHorizontal: 2 },
  socialButton: { width: 53, height: 53, alignItems: 'center', justifyContent: 'center', borderRadius: 60 },
  shareSecondary: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 48 },
  shareCopy: { color: v3.white, fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
