import { StyleSheet, Text, View } from 'react-native';

import { V3_COLORS, V3Page } from '../src/components/v3/V3Layout';
import {
  NEUROMARKET_PRIVACY_POLICY_EN, NEUROMARKET_PRIVACY_POLICY_ES,
  PRIVACY_POLICY_VERSION,
} from '../src/features/privacy/policy';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

/** Layout reproduces page 6; copy stays with the actual NeuroMarket notice. */
export default function PrivacyV3() {
  const { language } = useLanguage();
  const en = language === 'en';
  const sections = en ? NEUROMARKET_PRIVACY_POLICY_EN : NEUROMARKET_PRIVACY_POLICY_ES;

  return (
    <V3Page title={en ? 'PRIVACY' : 'PRIVACIDAD'}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{en ? 'PRIVACY POLICY' : 'POLÍTICAS DE PRIVACIDAD'}</Text>
        <Text style={styles.intro}>
          {en
            ? 'NeuroMarket manages LA Z 1310 and is committed to safeguarding your information. This is the app privacy notice.'
            : 'NeuroMarket opera LA Z 1310 y se compromete a proteger tu información. Este es el aviso de privacidad de la aplicación.'}
        </Text>
        {sections.map((section, i) => (
          <View key={section.title + i} style={styles.section}>
            <Text style={styles.heading}>{section.title.toUpperCase()}</Text>
            {section.paragraphs.map((paragraph, j) =>
              <Text key={j} style={styles.copy}>{paragraph}</Text>
            )}
          </View>
        ))}
        <Text style={styles.version}>{PRIVACY_POLICY_VERSION}</Text>
      </View>
    </V3Page>
  );
}
const styles = StyleSheet.create({
  sheet: { backgroundColor: V3_COLORS.panel, marginTop: 4, padding: 20, paddingTop: 36, paddingBottom: 30, borderRadius: 25 },
  title: { fontFamily: fonts.displayBlack, fontSize: 26, letterSpacing: 0.9, color: '#444' },
  intro: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 22, color: '#555' },
  section: { marginTop: 28 },
  heading: { fontFamily: fonts.displayExtraBold, fontSize: 21, letterSpacing: 0.3, color: '#444', marginBottom: 10 },
  copy: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#515151', marginBottom: 12 },
  version: { textAlign: 'center', fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 19, color: '#555' },
});
