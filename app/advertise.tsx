import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { V3_COLORS, V3Page } from '../src/components/v3/V3Layout';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

/** User-approved commercial design from page 4 of La Z App V3.pdf. */
export default function AdvertiseV3() {
  const router = useRouter();
  const { language } = useLanguage();
  const en = language === 'en';
  const facts = en
    ? [
      'Wide AM coverage in the Detroit metropolitan area.',
      'Presence in Metro Detroit urban and suburban communities.',
      'AM/FM, digital streaming and a mobile app.',
      'Digital content and an active social-media presence.',
    ]
    : [
      'Amplia cobertura de señal AM en el área de Detroit.',
      'Presencia en zonas urbanas y suburbanas de Metro Detroit.',
      'Acceso multiplataforma: AM/FM, streaming digital y app móvil.',
      'Expansión y participación constante en medios digitales y redes sociales.',
    ];

  return (
    <V3Page title={en ? 'ADVERTISE' : 'ANÚNCIATE'}>
      <View style={styles.coverage}>
        <Text style={styles.mapTitle}>COVERAGE MAP 1310 AM & 107.9 FM</Text>
        <Image
          source={require('../assets/brand/v3-coverage-maps.webp')}
          resizeMode="contain"
          accessibilityLabel={en ? 'Coverage maps for LA Z Detroit AM and FM' : 'Mapas de cobertura de LA Z Detroit AM y FM'}
          style={styles.map}
        />
        <Text style={styles.coverageNote}>
          {en
            ? 'We cover the production costs. Ask our team about advertising across radio, mobile and digital channels.'
            : 'Cubrimos los costos de producción. Consulta con nuestro equipo la publicidad en radio, app y medios digitales.'}
        </Text>
      </View>

      <View style={styles.audience}>
        <Text style={styles.heading}>{en ? 'LA Z DETROIT AUDIENCE' : 'AUDIENCIA DE LA Z DETROIT'}</Text>
        <Text style={styles.body}>
          {en
            ? 'Since 2017, WDTW LA Z Detroit 1310 AM and 107.9 FM has connected with the Spanish-speaking community in Metro Detroit through Regional Mexican programming. Its audience includes young adults, families, bilingual listeners and second-generation Hispanic households.'
            : 'Desde el 2017 WDTW La Z Detroit 1310 AM y 107.9 FM es una estación de radio en español consolidada en el mercado de Metro Detroit bajo el formato Regional Mexicano. Ha construido una relación basada en credibilidad, cercanía y resultados. Su audiencia es joven-adulta, familiar y bicultural, con presencia de oyentes bilingües y de segunda generación.'}
        </Text>
        <Text style={[styles.heading, styles.headingSecond]}>{en ? 'LA Z DETROIT OFFERS:' : 'LA Z DETROIT CUENTA CON:'}</Text>
        {facts.map(fact => (
          <View key={fact} style={styles.fact}><Text style={styles.bullet}>•</Text><Text style={styles.factText}>{fact}</Text></View>
        ))}
      </View>

      <Text style={styles.question}>{en ? 'HOW CAN WE HELP YOU?' : '¿CÓMO TE PODEMOS AYUDAR?'}</Text>
      <Text style={styles.quote}>
        {en
          ? '“IF YOU ARE NOT ON SPANISH-LANGUAGE RADIO, YOU ARE NOT PART OF THE LATINO CONSUMER’S DAILY CONVERSATION.”'
          : '“SI NO ESTÁS EN LA RADIO EN ESPAÑOL, NO ESTÁS EN LA CONVERSACIÓN DIARIA DEL CONSUMIDOR LATINO”'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={en ? 'Contact advertising sales' : 'Contactar al equipo comercial'}
        onPress={() => router.push('/contact')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{en ? 'Contact us' : 'Contáctanos'}</Text>
      </Pressable>
    </V3Page>
  );
}
const styles = StyleSheet.create({
  coverage: { backgroundColor: '#F6F6F6', paddingVertical: 12, paddingHorizontal: 12 },
  mapTitle: { fontFamily: fonts.displayBlack, fontSize: 21, color: '#111', textAlign: 'center', letterSpacing: 0.5 },
  map: { width: '100%', aspectRatio: 2048 / 1144, marginTop: 9 },
  coverageNote: { marginTop: 9, fontFamily: fonts.body, color: '#252525', textAlign: 'center', fontSize: 12, lineHeight: 17 },
  audience: { paddingHorizontal: 9, paddingTop: 28 },
  heading: { fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 27, letterSpacing: 0.9, marginBottom: 9 },
  headingSecond: { marginTop: 18 },
  body: { fontFamily: fonts.body, color: V3_COLORS.white, fontSize: 14, lineHeight: 22 },
  fact: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  bullet: { fontFamily: fonts.bodyBold, color: V3_COLORS.white, fontSize: 19 },
  factText: { fontFamily: fonts.body, color: V3_COLORS.white, fontSize: 14, flex: 1, lineHeight: 20 },
  question: { backgroundColor: V3_COLORS.red, borderRadius: 40, overflow: 'hidden', textAlign: 'center', color: V3_COLORS.white, fontFamily: fonts.displayBlack, fontSize: 23, marginTop: 33, paddingVertical: 9 },
  quote: { fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 23, lineHeight: 27, letterSpacing: 0.5, textAlign: 'center', marginTop: 28, marginBottom: 27 },
  button: { minHeight: 52, borderRadius: 30, backgroundColor: V3_COLORS.red, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 24 },
});
