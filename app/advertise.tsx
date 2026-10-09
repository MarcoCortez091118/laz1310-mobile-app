import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { V3Screen, v3 } from '../src/components/v3/V3Shell';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

export default function AdvertiseScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const english = language === 'en';

  return (
    <V3Screen title={english ? 'ADVERTISE' : 'ANÚNCIATE'}>
      <View style={styles.coverage}>
        <Text style={styles.coverageTitle}>
          {english ? 'COVERAGE MAP 1310 AM & 107.9 FM' : 'COBERTURA 1310 AM Y 107.9 FM'}
        </Text>
        <View style={styles.coverageRow}>
          <View style={styles.coverageCard}>
            <Text style={styles.signalLabel}>AM</Text>
            <View style={styles.signalHalo}><View style={styles.signalCore} /></View>
            <Text style={styles.coverageCity}>DETROIT</Text>
            <Text style={styles.coverageDetail}>WDTW · 1310 AM</Text>
          </View>
          <View style={styles.coverageCard}>
            <Text style={styles.signalLabel}>FM</Text>
            <View style={[styles.signalHalo, styles.fmHalo]}><View style={styles.signalCore} /></View>
            <Text style={styles.coverageCity}>DETROIT</Text>
            <Text style={styles.coverageDetail}>107.9 FM</Text>
          </View>
        </View>
        <Text style={styles.coverageCaption}>
          {english
            ? 'Metro Detroit and surrounding communities'
            : 'Metro Detroit y comunidades cercanas'}
        </Text>
      </View>
      <View style={styles.audience}>
        <Text style={styles.heading}>
          {english ? 'LA Z DETROIT AUDIENCE' : 'AUDIENCIA DE LA Z DETROIT'}
        </Text>
        <Text style={styles.paragraph}>
          {english
            ? 'Since 2017, WDTW LA Z Detroit 1310 AM and 107.9 FM has connected with Metro Detroit through Mexican regional music and Spanish-language programming. Its audience includes young adults, families, bilingual listeners and second-generation Hispanic households.'
            : 'Desde el 2017 WDTW La Z Detroit 1310 AM y 107.9 FM conecta con Metro Detroit a través de la música regional mexicana y la programación en español. Su audiencia incluye adultos jóvenes, familias, oyentes bilingües y hogares hispanos de segunda generación.'}
        </Text>
        <Text style={[styles.heading, styles.secondaryHeading]}>
          {english ? 'LA Z DETROIT OFFERS:' : 'LA Z DETROIT CUENTA CON:'}
        </Text>
        {(
          english
            ? ['Radio signal in the Detroit area.', 'Presence in urban and suburban Metro Detroit communities.', 'AM/FM broadcasts, digital streaming and a mobile app.', 'Digital content and social media presence.']
            : ['Señal de radio en el área de Detroit.', 'Presencia en comunidades urbanas y suburbanas de Metro Detroit.', 'Transmisión AM/FM, streaming digital y app móvil.', 'Contenido digital y presencia en redes sociales.']
        ).map((point) => (
          <View style={styles.bulletRow} key={point}>
            <Text style={styles.bullet}>•</Text><Text style={styles.bulletCopy}>{point}</Text>
          </View>
        ))}
      </View>
      <View style={styles.salesSection}>
        <Text style={styles.salesTitle}>
          {english ? 'HOW CAN WE HELP YOU?' : '¿CÓMO TE PODEMOS AYUDAR?'}
        </Text>
        <Text style={styles.quote}>
          {english
            ? '“IF YOU ARE NOT ON SPANISH-LANGUAGE RADIO, YOU ARE NOT IN YOUR LATINO CUSTOMER’S DAILY CONVERSATION.”'
            : '“SI NO ESTÁS EN LA RADIO EN ESPAÑOL, NO ESTÁS EN LA CONVERSACIÓN DIARIA DEL CONSUMIDOR LATINO”'}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/contact')} style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.75 : 1 }]}>
          <Text style={styles.ctaLabel}>{english ? 'CONTACT US' : 'CONTÁCTANOS'}</Text>
          <Ionicons color={v3.white} name="chevron-forward" size={23} />
        </Pressable>
      </View>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  coverage: { marginTop: 0, padding: 12, backgroundColor: 'rgba(247,247,247,0.93)', borderRadius: 4 },
  coverageTitle: { color: '#191919', fontFamily: fonts.displayBlack, fontSize: 22, textAlign: 'center', letterSpacing: 0.4, marginBottom: 8 },
  coverageRow: { flexDirection: 'row', gap: 7 },
  coverageCard: { flex: 1, backgroundColor: '#243034', minHeight: 135, borderRadius: 5, borderColor: '#676767', borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 4, overflow: 'hidden' },
  signalLabel: { position: 'absolute', top: 4, left: 7, color: v3.red, fontFamily: fonts.displayBlack, fontSize: 24 },
  signalHalo: { width: 103, height: 58, backgroundColor: 'rgba(227,8,21,0.35)', borderWidth: 2, borderColor: 'rgba(235,4,19,0.8)', borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  fmHalo: { width: 72, height: 58 },
  signalCore: { width: 31, height: 31, backgroundColor: 'rgba(225,4,20,0.82)', borderRadius: 40 },
  coverageCity: { fontFamily: fonts.displayExtraBold, color: v3.white, letterSpacing: 1.2, fontSize: 16 },
  coverageDetail: { fontFamily: fonts.body, color: '#D9D9D9', fontSize: 10 },
  coverageCaption: { fontFamily: fonts.bodySemiBold, color: '#333333', fontSize: 12, lineHeight: 17, textAlign: 'center', paddingTop: 9 },
  audience: { paddingHorizontal: 12, paddingTop: 26 },
  heading: { fontFamily: fonts.displayBlack, fontSize: 26, color: v3.white, letterSpacing: 1.1, marginBottom: 10 },
  secondaryHeading: { marginTop: 18 },
  paragraph: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: '#F1EDED' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 },
  bullet: { fontFamily: fonts.bodyBold, color: v3.white, fontSize: 19, lineHeight: 22 },
  bulletCopy: { fontFamily: fonts.body, color: '#F1EDED', fontSize: 14, lineHeight: 21, flex: 1 },
  salesSection: { marginTop: 30, gap: 16, alignItems: 'stretch', paddingBottom: 15 },
  salesTitle: { color: v3.white, backgroundColor: v3.red, borderRadius: 35, paddingVertical: 9, fontFamily: fonts.displayBlack, fontSize: 20, letterSpacing: 0.5, textAlign: 'center' },
  quote: { fontFamily: fonts.displayBlack, fontSize: 23, color: v3.white, lineHeight: 26, textAlign: 'center', paddingVertical: 12 },
  cta: { backgroundColor: v3.red, borderRadius: 40, minHeight: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
  ctaLabel: { fontFamily: fonts.displayBlack, fontSize: 23, color: v3.white },
});
