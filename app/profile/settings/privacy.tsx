import Ionicons from '@expo/vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

const rows = [
  ['Política de privacidad', 'Cómo tratamos tus datos'],
  ['Términos de uso', 'Condiciones del servicio'],
  ['Soporte', 'Ayuda y contacto'],
  ['Versión de la app', '0.1.0'],
];

export default function PrivacyScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <View style={styles.content}>
        <ScreenHeader title="Privacidad y acerca de" />

        <Text style={[styles.title, { color: colors.white }]}>
          LA Z 1310
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Información legal, soporte y detalles de esta instalación.
        </Text>

        <View style={styles.rows}>
          {rows.map(([title, subtitle]) => (
            <View
              key={title}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.copy}>
                <Text style={[styles.rowTitle, { color: colors.white }]}>
                  {title}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {subtitle}
                </Text>
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
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  rows: {
    gap: 10,
    marginTop: spacing.lg,
  },
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: spacing.md,
  },
  copy: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
});
