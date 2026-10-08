import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  PRIVACY_POLICY_VERSION,
  RADIO_ONLINE_HD_PRIVACY_POLICY_ES,
} from '../../../src/features/privacy/policy';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function PrivacyPolicyScreen() {
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={
            english
              ? 'Radio Online HD privacy policy'
              : 'Política de privacidad de Radio Online HD'
          }
        />

        <View
          style={[
            styles.notice,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: colors.white }]}>
            {english ? 'Official policy text' : 'Texto oficial de la política'}
          </Text>
          <Text style={[styles.noticeBody, { color: colors.muted }]}>
            {english
              ? 'The official policy provided for this integration is shown in Spanish below without modifying its legal wording.'
              : 'La política proporcionada para esta integración se muestra íntegramente a continuación, sin modificar su redacción legal.'}
          </Text>
          <Text style={[styles.version, { color: colors.red }]}>
            VERSION · {PRIVACY_POLICY_VERSION}
          </Text>
        </View>

        {RADIO_ONLINE_HD_PRIVACY_POLICY_ES.map((section) => (
          <View key={section.title ?? section.paragraphs[0]} style={styles.section}>
            {section.title ? (
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                {section.title}
              </Text>
            ) : null}

            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={`${section.title ?? 'section'}-${index}`}
                style={[styles.paragraph, { color: colors.muted }]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
    paddingHorizontal: spacing.md,
  },
  notice: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  noticeTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  noticeBody: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  version: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.7,
    marginTop: 10,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 25,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 12,
  },
});
