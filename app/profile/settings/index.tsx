import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

const rows = [
  {
    title: 'Cuenta',
    subtitle: 'Correo, sesión y seguridad',
    route: '/profile/settings/account' as const,
  },
  {
    title: 'Apariencia',
    subtitle: 'Selecciona tema claro u oscuro',
    route: '/profile/settings/appearance' as const,
  },
  {
    title: 'Notificaciones',
    subtitle: 'General, radio, programas y dinámicas',
  },
  {
    title: 'Privacidad y acerca de',
    subtitle: 'Legal, soporte e información',
    route: '/profile/settings/privacy' as const,
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, preference } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <View style={styles.content}>
        <ScreenHeader title="Configuración" />
        <Text style={[styles.title, { color: colors.white }]}>
          Preferencias de la app
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Personaliza cómo se ve y cómo se comporta LA Z en este dispositivo.
        </Text>

        <View style={styles.rows}>
          {rows.map((row) => (
            <Pressable
              key={row.title}
              disabled={!row.route}
              onPress={() => row.route && router.push(row.route)}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: row.route ? 1 : 0.58,
                },
              ]}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.white }]}>
                  {row.title}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {row.subtitle}
                </Text>
              </View>
              {row.title === 'Apariencia' ? (
                <Text style={[styles.value, { color: colors.red }]}>
                  {preference === 'dark' ? 'Oscuro' : 'Claro'}
                </Text>
              ) : null}
              <Ionicons color={colors.gray} name="chevron-forward" size={20} />
            </Pressable>
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
  rowCopy: {
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
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginRight: 8,
  },
});
