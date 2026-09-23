import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function AccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <View style={styles.content}>
        <ScreenHeader title="Cuenta" />

        <Text style={[styles.title, { color: colors.white }]}>
          Tu cuenta
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Esta pantalla usa datos de demostración hasta integrar Firebase Auth.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.muted }]}>CORREO</Text>
          <Text style={[styles.value, { color: colors.white }]}>
            usuario@correo.com
          </Text>
          <Text style={[styles.verified, { color: colors.red }]}>
            VERIFICADO
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Cerrar sesión"
            onPress={() => {
              signOut();
              router.replace('/auth');
            }}
            secondary
          />
          <PrimaryButton
            disabled
            label="Eliminar cuenta · backend pendiente"
            onPress={() => {}}
            secondary
          />
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
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
  },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    marginTop: 8,
  },
  verified: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 10,
  },
  actions: {
    gap: 12,
    marginTop: spacing.lg,
  },
});
