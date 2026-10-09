import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { V3Screen, v3 } from '../src/components/v3/V3Shell';
import {
  NEUROMARKET_PRIVACY_POLICY_EN,
  NEUROMARKET_PRIVACY_POLICY_ES,
  PRIVACY_POLICY_VERSION,
} from '../src/features/privacy/policy';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

export default function PrivacyV3Screen() {
  const { language } = useLanguage();
  const router = useRouter();
  const english = language === 'en';
  const sections = english ? NEUROMARKET_PRIVACY_POLICY_EN : NEUROMARKET_PRIVACY_POLICY_ES;

  return (
    <V3Screen title={english ? 'PRIVACY' : 'PRIVACIDAD'}>
      <View style={styles.paper}>
        <Text style={styles.title}>
          {english ? 'PRIVACY NOTICE' : 'POLÍTICAS DE PRIVACIDAD'}
        </Text>
        <Text style={styles.intro}>
          {english
            ? 'NeuroMarket respects your privacy. Below you can review the information practices applicable to LA Z 1310.'
            : 'NeuroMarket respeta tu privacidad. A continuación puedes consultar cómo tratamos la información en LA Z 1310.'}
        </Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text style={styles.paragraph} key={index}>{paragraph}</Text>
            ))}
          </View>
        ))}
        <Text style={styles.version}>{PRIVACY_POLICY_VERSION}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={english ? 'Go back to Radio' : 'Volver a Radio'}
        onPress={() => router.replace('/radio')}
        style={styles.backButton}
      >
        <Ionicons name="chevron-down" size={27} color={v3.white} />
        <Text style={styles.backCopy}>{english ? 'BACK TO RADIO' : 'VOLVER A RADIO'}</Text>
      </Pressable>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: 'rgba(236,236,236,0.78)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 31,
    paddingBottom: 27,
    marginTop: 3,
  },
  title: {
    color: '#444444',
    fontFamily: fonts.displayBlack,
    fontSize: 26,
    letterSpacing: 0.8,
  },
  intro: {
    fontFamily: fonts.body,
    color: '#4A4A4A',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 19,
  },
  section: { marginTop: 29 },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 21,
    color: '#414141',
    letterSpacing: 0.4,
    marginBottom: 11,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: '#4A4A4A',
    marginBottom: 12,
  },
  version: {
    fontFamily: fonts.bodyMedium,
    color: '#515151',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: 10, minHeight: 54 },
  backCopy: { fontFamily: fonts.bodySemiBold, color: v3.white, fontSize: 11 },
});
