import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function initials(name: string | null, email: string | null) {
  const source = (name || email || 'LA Z').trim();
  const words = source.split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { status, isAuthenticated, profile, error, refreshProfile } = useAuth();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  if (status === 'initializing' || status === 'syncing') {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.safe, { backgroundColor: colors.black }]}
      >
        <View style={styles.loading}>
          <ActivityIndicator color={colors.red} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Sincronizando tu perfil…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error' && !isAuthenticated) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.safe, { backgroundColor: colors.black }]}
      >
        <View style={styles.loading}>
          <Ionicons color={colors.red} name="cloud-offline-outline" size={36} />
          <Text style={[styles.errorTitle, { color: colors.white }]}>
            No pudimos validar tu sesión
          </Text>
          <Text style={[styles.errorBody, { color: colors.muted }]}>
            {error ??
              'Firebase está autenticado, pero LA Z API no pudo sincronizar el perfil.'}
          </Text>
          <View style={styles.retry}>
            <PrimaryButton
              label="Reintentar"
              onPress={() => void refreshProfile()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>Perfil</Text>

        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.red }]}>
            <Text style={styles.avatarText}>
              {initials(profile.displayName, profile.email)}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: colors.white }]}>
              {profile.displayName || 'Completa tu perfil'}
            </Text>
            <Text style={[styles.email, { color: colors.muted }]}>
              {profile.email || 'Sin correo disponible'}
            </Text>
            <View style={styles.badges}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: profile.emailVerified
                      ? 'rgba(36, 166, 91, 0.14)'
                      : colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  color={profile.emailVerified ? '#56C985' : colors.muted}
                  name={
                    profile.emailVerified
                      ? 'checkmark-circle-outline'
                      : 'mail-unread-outline'
                  }
                  size={13}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: profile.emailVerified
                        ? '#56C985'
                        : colors.muted,
                    },
                  ]}
                >
                  {profile.emailVerified ? 'EMAIL VERIFICADO' : 'EMAIL PENDIENTE'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Editar perfil"
            onPress={() => router.push('/profile/edit')}
            secondary
          />
        </View>

        <View
          style={[
            styles.accountCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.accountRow}>
            <Ionicons color={colors.red} name="location-outline" size={20} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountLabel, { color: colors.muted }]}>
                ZONA HORARIA
              </Text>
              <Text style={[styles.accountValue, { color: colors.white }]}>
                {profile.timezone || 'Pendiente'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.accountRow}>
            <Ionicons color={colors.red} name="language-outline" size={20} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountLabel, { color: colors.muted }]}>
                IDIOMA
              </Text>
              <Text style={[styles.accountValue, { color: colors.white }]}>
                {profile.locale || 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.white }]}>
          Cuenta y aplicación
        </Text>

        <View style={styles.rows}>
          <Pressable
            onPress={() => router.push('/profile/settings/account')}
            style={[
              styles.row,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="person-circle-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>Cuenta</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                Correo, verificación y sesión
              </Text>
            </View>
            <Ionicons color={colors.gray} name="chevron-forward" size={20} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile/settings')}
            style={[
              styles.row,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="settings-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>
                Configuración
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                Apariencia y preferencias disponibles
              </Text>
            </View>
            <Ionicons color={colors.gray} name="chevron-forward" size={20} />
          </Pressable>
        </View>

        <Text style={[styles.scopeNote, { color: colors.muted }]}>
          Favoritos, guardados e intereses se conectarán cuando sus contratos de
          producto estén definidos.
        </Text>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 12,
  },
  errorTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    marginTop: 18,
    textAlign: 'center',
  },
  errorBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  retry: {
    marginTop: 24,
    width: '100%',
  },
  content: {
    paddingBottom: 180,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 36,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarText: {
    color: '#FEFEFE',
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
  },
  profileCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 29,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 9,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 7,
    letterSpacing: 0.6,
  },
  actions: {
    marginTop: 18,
  },
  accountCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: spacing.md,
  },
  accountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 70,
  },
  accountCopy: {
    flex: 1,
    marginLeft: 12,
  },
  accountLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  accountValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginTop: 3,
  },
  divider: { height: 1 },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    marginTop: 26,
  },
  rows: {
    gap: 10,
    marginTop: 12,
  },
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: spacing.md,
  },
  rowCopy: {
    flex: 1,
    marginLeft: 12,
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
  scopeNote: {
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 22,
    textAlign: 'center',
  },
});
