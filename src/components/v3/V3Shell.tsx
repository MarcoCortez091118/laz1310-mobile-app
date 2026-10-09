import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '../BrandLogo';
import { shareLiveRadio } from '../../config/share';
import { useLanguage } from '../../i18n/LanguageProvider';
import { fonts } from '../../theme/tokens';

const INK = '#070404';
const RED = '#D50013';
const WHITE = '#FFFFFF';

type V3Destination = '/radio' | '/prizes' | '/advertise' | '/privacy';

const nav = [
  { key: 'radio', route: '/radio', labelEs: 'Radio', labelEn: 'Radio', icon: 'play' },
  { key: 'share', route: null, labelEs: 'Compartir', labelEn: 'Share', icon: 'share-social' },
  { key: 'prizes', route: '/prizes', labelEs: 'Premios', labelEn: 'Prizes', icon: 'star' },
  { key: 'advertise', route: '/advertise', labelEs: 'Anúnciate', labelEn: 'Advertise', icon: 'chatbubbles' },
  { key: 'privacy', route: '/privacy', labelEs: 'Privacidad', labelEn: 'Privacy', icon: 'list' },
] as const;

export function V3Backdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.backdrop} />
      <Image
        source={require('../../../assets/brand/La Z Icon.webp')}
        resizeMode="cover"
        style={styles.skyline}
      />
      <View style={styles.skylineShade} />
      <View style={styles.topPaint} />
      <View style={[styles.topStroke, { transform: [{ rotate: '-11deg' }] }]} />
      <View style={[styles.topStrokeTwo, { transform: [{ rotate: '-13deg' }] }]} />
      <View style={styles.cornerSplash} />
    </View>
  );
}

export function V3Header({ title, radioShortcut = true }: { title: string; radioShortcut?: boolean }) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const english = language === 'en';
  return (
    <View style={styles.header}>
      <BrandLogo variant="negative" width={108} />
      <View style={styles.headerRight}>
        <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.heading}>
          {title.toUpperCase()}
        </Text>
        <View style={styles.headerActions}>
          {radioShortcut ? (
            <Pressable accessibilityLabel={english ? 'Listen live' : 'Radio en vivo'} accessibilityRole="button" onPress={() => router.replace('/radio')} style={styles.livePill}>
              <Ionicons name="play-circle" color={RED} size={19} />
              <Text style={styles.liveText}>{english ? 'LIVE RADIO' : 'RADIO EN VIVO'}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityLabel={english ? 'Change language to Spanish' : 'Cambiar idioma a inglés'} accessibilityRole="button" onPress={() => setLanguage(english ? 'es' : 'en')} style={styles.languagePill}>
            <Ionicons color={WHITE} name="globe-outline" size={17} />
            <Text style={styles.languageText}>{english ? 'ENG' : 'ESP'}</Text>
            <Ionicons color={WHITE} name="chevron-forward" size={14} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function V3BottomNavigation() {
  const router = useRouter();
  const path = usePathname();
  const { language } = useLanguage();
  const english = language === 'en';
  const [sharing, setSharing] = useState(false);

  async function share() {
    if (sharing) return;
    setSharing(true);
    try {
      await shareLiveRadio(language);
    } catch {
      Alert.alert(english ? 'Unable to share' : 'No se pudo compartir', english ? 'Try again later.' : 'Inténtalo de nuevo.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <View accessibilityRole="tablist" style={styles.navBar}>
      {nav.map((item, index) => {
        const selected = item.route === path || (item.key === 'advertise' && path === '/contact');
        return (
          <Pressable
            accessibilityLabel={english ? item.labelEn : item.labelEs}
            accessibilityRole={item.key === 'share' ? 'button' : 'tab'}
            accessibilityState={item.key === 'share' ? { disabled: sharing } : { selected }}
            disabled={item.key === 'share' && sharing}
            key={item.key}
            onPress={() => {
              if (item.key === 'share') {
                void share();
              } else if (item.route && !selected) {
                router.replace(item.route as V3Destination);
              }
            }}
            style={({ pressed }) => [styles.navItem, { opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, selected && styles.activeIcon]}>
              <Ionicons color={WHITE} name={item.icon} size={23} />
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.navLabel}>
              {english ? item.labelEn : item.labelEs}
            </Text>
            {index !== nav.length - 1 && <View pointerEvents="none" style={styles.navDivider} />}
          </Pressable>
        );
      })}
    </View>
  );
}

export function V3Screen({
  title,
  radioShortcut = true,
  children,
}: {
  title: string;
  radioShortcut?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <V3Backdrop />
      <V3Header title={title} radioShortcut={radioShortcut} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <V3BottomNavigation />
    </SafeAreaView>
  );
}

export const v3 = { red: RED, white: WHITE, ink: INK };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: INK },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: INK },
  skyline: { bottom: 0, left: 0, position: 'absolute', width: '100%', height: 380, opacity: 0.42 },
  skylineShade: { bottom: 0, left: 0, right: 0, height: 380, backgroundColor: 'rgba(0,0,0,0.43)', position: 'absolute' },
  topPaint: { top: -14, left: 0, right: 0, height: 128, position: 'absolute', backgroundColor: '#BF0010' },
  topStroke: { position: 'absolute', top: 104, left: -50, right: -60, backgroundColor: RED, height: 25 },
  topStrokeTwo: { position: 'absolute', top: 122, left: -50, right: -60, backgroundColor: '#610006', height: 9 },
  cornerSplash: { position: 'absolute', top: 130, right: -45, width: 150, height: 72, backgroundColor: 'rgba(211,0,18,0.34)', transform: [{ rotate: '-18deg' }] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 112, paddingHorizontal: 14, zIndex: 2, gap: 6 },
  headerRight: { alignItems: 'flex-end', flex: 1, gap: 3 },
  heading: { fontFamily: fonts.displayBlack, color: WHITE, fontSize: 29, letterSpacing: 1, textAlign: 'right' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  livePill: { minHeight: 30, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: WHITE, borderRadius: 25 },
  liveText: { color: '#BD0010', fontFamily: fonts.displayExtraBold, fontSize: 14 },
  languagePill: { minHeight: 32, backgroundColor: '#191619', paddingHorizontal: 8, borderRadius: 25, flexDirection: 'row', gap: 5, alignItems: 'center' },
  languageText: { color: WHITE, fontFamily: fonts.bodyBold, fontSize: 12 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 128, flexGrow: 1 },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 89, borderTopWidth: 2, borderTopColor: '#353333', backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'flex-start', paddingTop: 10, zIndex: 5 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 66, gap: 5 },
  navIcon: { width: 44, height: 31, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#292929' },
  activeIcon: { backgroundColor: RED },
  navLabel: { color: WHITE, fontFamily: fonts.bodyMedium, fontSize: 10, textAlign: 'center', letterSpacing: 0.2 },
  navDivider: { position: 'absolute', right: 0, top: 6, height: 43, width: 1, backgroundColor: '#595959' },
});
