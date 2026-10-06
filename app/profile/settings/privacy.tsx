import Ionicons from '@expo/vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function PrivacyScreen() {
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const rows = english
    ? [
        ['Privacy policy', 'How we handle your data'],
        ['Terms of use', 'Service conditions'],
        ['Support', 'Help and contact'],
        ['App version', '0.1.0'],
      ]
    : [
        ['Política de privacidad', 'Cómo tratamos tus datos'],
        ['Términos de uso', 'Condiciones del servicio'],
        ['Soporte', 'Ayuda y contacto'],
        ['Versión de la app', '0.1.0'],
      ];

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.black }]}>
      <View style={styles.content}>
        <ScreenHeader title={english ? 'Privacy & about' : 'Privacidad y acerca de'} />

        <Text style={[styles.title, { color: colors.white }]}>LA Z 1310</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Legal information, support and details about this installation.'
            : 'Información legal, soporte y detalles de esta instalación.'}
        </Text>

        <View style={styles.rows}>
          {rows.map(([title, subtitle]) => (
            <View key={title} style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.copy}>
                <Text style={[styles.rowTitle, { color: colors.white }]}>{title}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{subtitle}</Text>
              </View>
              <Ionicons color={colors.gray} name="chevron-forward" size={20} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.md },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 30, marginTop: spacing.lg },
  subtitle: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  rows: { gap: 10, marginTop: spacing.lg },
  row: { alignItems: 'center', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', minHeight: 68, paddingHorizontal: spacing.md },
  copy: { flex: 1 },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
});
