import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import {
  Alert, Image, ImageBackground, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '../BrandLogo';
import { shareLiveRadio } from '../../config/share';
import { useLanguage } from '../../i18n/LanguageProvider';
import { fonts } from '../../theme/tokens';

export const V3_COLORS = {
  black: '#080505', red: '#D50513', white: '#FEFEFE',
  gray: '#D7D7D7', panel: 'rgba(233,233,233,0.81)',
} as const;

type Destination = '/radio' | '/prizes' | '/advertise' | '/privacy';
const DESTINATIONS = [
  { id: 'radio', route: '/radio', icon: 'play', es: 'Radio', en: 'Radio' },
  { id: 'share', route: null, icon: 'share-social', es: 'Compartir', en: 'Share' },
  { id: 'prizes', route: '/prizes', icon: 'star', es: 'Premios', en: 'Prizes' },
  { id: 'advertise', route: '/advertise', icon: 'chatbubbles', es: 'Anúnciate', en: 'Advertise' },
  { id: 'privacy', route: '/privacy', icon: 'list', es: 'Privacidad', en: 'Privacy' },
] as const;

function PageBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.canvas} />
      <View style={styles.paintTop} />
      <View style={styles.paintStroke} />
      <View style={styles.paintFine} />
      <ImageBackground
        source={require('../../../assets/brand/v3-detroit-skyline.webp')}
        resizeMode="stretch"
        style={styles.skyline}
        imageStyle={styles.skylineImage}
      >
        <View style={styles.skylineTint} />
      </ImageBackground>
    </View>
  );
}

function TopHeader({ title, showRadioShortcut }: { title: string; showRadioShortcut: boolean }) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const en = language === 'en';

  return (
    <View style={styles.header}>
      <BrandLogo variant="negative" width={105} />
      <View style={styles.headerText}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.pageTitle}>
          {title.toUpperCase()}
        </Text>
        <View style={styles.topActions}>
          {showRadioShortcut && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={en ? 'Listen to live radio' : 'Escuchar radio en vivo'}
              onPress={() => router.replace('/radio')}
              style={styles.radioShortcut}
            >
              <Ionicons color={V3_COLORS.red} name="play-circle" size={18} />
              <Text style={styles.radioShortcutText}>{en ? 'LIVE RADIO' : 'RADIO EN VIVO'}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={en ? 'Switch to Spanish' : 'Cambiar a inglés'}
            onPress={() => setLanguage(en ? 'es' : 'en')}
            style={styles.language}
          >
            <Ionicons name="globe-outline" size={15} color={V3_COLORS.white} />
            <Text style={styles.languageCopy}>{en ? 'ENG' : 'ESP'}</Text>
            <Ionicons name="chevron-forward" size={13} color={V3_COLORS.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FooterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await shareLiveRadio(language);
    } catch {
      Alert.alert(language === 'en' ? 'Unable to share' : 'No se pudo compartir');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 9) }]}>
      {DESTINATIONS.map((item, index) => {
        const selected = pathname === item.route ||
          (item.id === 'advertise' && pathname === '/contact');
        const label = language === 'en' ? item.en : item.es;
        return (
          <Pressable
            key={item.id}
            accessibilityRole={item.id === 'share' ? 'button' : 'tab'}
            accessibilityState={item.id === 'share' ? { disabled: sharing } : { selected }}
            accessibilityLabel={label}
            disabled={item.id === 'share' && sharing}
            onPress={() => {
              if (item.id === 'share') void share();
              else if (item.route && !selected) router.replace(item.route as Destination);
            }}
            style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.tabIcon, selected && styles.tabIconSelected]}>
              <Ionicons name={item.icon} size={23} color={V3_COLORS.white} />
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.tabText}>{label}</Text>
            {index < DESTINATIONS.length - 1 && <View pointerEvents="none" style={styles.divider} />}
          </Pressable>
        );
      })}
    </View>
  );
}

type V3PageProps = PropsWithChildren<{
  title: string;
  showRadioShortcut?: boolean;
}>;

/** Shared V3 shell: backgrounds, header, scroll, and five PDF destinations. */
export function V3Page({ title, showRadioShortcut = true, children }: V3PageProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <PageBackdrop />
      <TopHeader title={title} showRadioShortcut={showRadioShortcut} />
      <ScrollView
        contentContainerStyle={[styles.pageContent, { paddingBottom: 115 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <FooterNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: V3_COLORS.black },
  canvas: { ...StyleSheet.absoluteFillObject, backgroundColor: V3_COLORS.black },
  paintTop: { position: 'absolute', top: -45, left: 0, right: -20, height: 164, backgroundColor: '#BF0011' },
  paintStroke: { position: 'absolute', top: 113, left: -30, right: -60, height: 28, backgroundColor: '#D50513', transform: [{ rotate: '-8deg' }] },
  paintFine: { position: 'absolute', top: 140, left: -15, right: -60, height: 10, backgroundColor: 'rgba(96,0,6,0.85)', transform: [{ rotate: '-9deg' }] },
  skyline: { position: 'absolute', bottom: 72, left: 0, right: 0, height: 285 },
  skylineImage: { opacity: 0.78 },
  skylineTint: { flex: 1, backgroundColor: 'rgba(0,0,0,0.24)' },
  header: { minHeight: 112, paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', gap: 6, alignItems: 'center' },
  headerText: { alignItems: 'flex-end', flex: 1, gap: 3 },
  pageTitle: { fontFamily: fonts.displayBlack, fontSize: 30, color: V3_COLORS.white, letterSpacing: 1.0, textAlign: 'right' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  radioShortcut: { minHeight: 31, paddingHorizontal: 9, gap: 4, backgroundColor: V3_COLORS.white, borderRadius: 30, flexDirection: 'row', alignItems: 'center' },
  radioShortcutText: { fontFamily: fonts.displayExtraBold, fontSize: 14, color: '#C50012' },
  language: { borderRadius: 30, minHeight: 32, flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 8, backgroundColor: '#201E1E' },
  languageCopy: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: V3_COLORS.white },
  pageContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 73, backgroundColor: '#1B1B1B', borderTopColor: '#505050', borderTopWidth: 1, flexDirection: 'row', paddingTop: 8, zIndex: 5 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 4, minHeight: 56 },
  tabIcon: { width: 46, height: 32, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2B2B2B' },
  tabIconSelected: { backgroundColor: V3_COLORS.red },
  tabText: { fontFamily: fonts.body, fontSize: 10, color: V3_COLORS.white, textAlign: 'center' },
  divider: { position: 'absolute', right: 0, top: 5, height: 45, width: 1, backgroundColor: '#606060' },
});
