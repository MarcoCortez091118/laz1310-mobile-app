import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { NotificationCategory } from '../../../src/features/notifications/api';
import { useNotifications } from '../../../src/features/notifications/NotificationsProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

const categories: Array<{
  key: NotificationCategory;
  title: string;
  subtitle: string;
}> = [
  { key: 'general', title: 'General', subtitle: 'Avisos generales de LA Z' },
  { key: 'radio', title: 'Radio', subtitle: 'Transmisión y novedades de radio' },
  { key: 'programs', title: 'Programas', subtitle: 'Contenido y programación' },
  { key: 'dynamics', title: 'Dinámicas', subtitle: 'Concursos y oportunidades de participar' },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const { colors } = useAppTheme();
  const {
    preferences,
    pushEnabled,
    permissionStatus,
    loading,
    error,
    updatePreferences,
    enablePush,
    disablePush,
    refreshPreferences,
  } = useNotifications();
  const [workingCategory, setWorkingCategory] = useState<NotificationCategory | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  const toggleCategory = async (key: NotificationCategory, value: boolean) => {
    setWorkingCategory(key);
    setLocalError(null);
    try {
      await updatePreferences({ [key]: value });
    } catch (updateError) {
      setLocalError(
        updateError instanceof Error
          ? updateError.message
          : 'No pudimos guardar la preferencia.',
      );
    } finally {
      setWorkingCategory(null);
    }
  };

  const togglePush = async (enabled: boolean) => {
    setLocalError(null);
    try {
      if (enabled) {
        const granted = await enablePush();
        if (!granted) {
          setLocalError('El teléfono no concedió permiso para mostrar notificaciones.');
        }
      } else {
        await disablePush();
      }
    } catch (pushError) {
      setLocalError(
        pushError instanceof Error
          ? pushError.message
          : 'No pudimos cambiar el estado de las notificaciones.',
      );
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.black }]}>
      <View style={styles.content}>
        <ScreenHeader title="Notificaciones" />
        <Text style={[styles.title, { color: colors.white }]}>Tus avisos</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          El permiso del teléfono controla push. Las categorías deciden qué avisos nuevos recibes en push e inbox.
        </Text>

        <View
          style={[
            styles.pushCard,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <View style={[styles.icon, { backgroundColor: colors.burgundy }]}>
            <Ionicons color={colors.red} name="notifications-outline" size={22} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: colors.white }]}>Push en este dispositivo</Text>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
              {pushEnabled
                ? 'Activo y registrado con FCM'
                : permissionStatus === 'denied'
                  ? 'Desactivado o sin permiso del sistema'
                  : 'Desactivado'}
            </Text>
          </View>
          <Switch
            disabled={loading}
            onValueChange={(value) => void togglePush(value)}
            value={pushEnabled}
          />
        </View>

        {permissionStatus === 'denied' && !pushEnabled ? (
          <Pressable
            onPress={() => void Linking.openSettings()}
            style={styles.settingsLink}
          >
            <Text style={[styles.settingsLinkText, { color: colors.red }]}>
              Abrir ajustes del sistema
            </Text>
          </Pressable>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.white }]}>Categorías</Text>

        {!preferences ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.red} />
            <Pressable onPress={() => void refreshPreferences()}>
              <Text style={[styles.loadingText, { color: colors.muted }]}>Cargando preferencias…</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.rows}>
            {categories.map((category) => (
              <View
                key={category.key}
                style={[
                  styles.row,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <View style={styles.copy}>
                  <Text style={[styles.rowTitle, { color: colors.white }]}>{category.title}</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{category.subtitle}</Text>
                </View>
                <Switch
                  disabled={workingCategory !== null}
                  onValueChange={(value) => void toggleCategory(category.key, value)}
                  value={preferences[category.key]}
                />
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.note, { color: colors.muted }]}>
          “General” es una categoría independiente; no es un interruptor maestro. Tus intereses de contenido se administran aparte en Perfil.
        </Text>

        {localError || error ? (
          <Text style={[styles.error, { color: colors.red }]}>{localError ?? error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.md },
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
  pushCard: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.lg,
    minHeight: 74,
    padding: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  copy: { flex: 1 },
  rowTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  settingsLink: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  settingsLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    marginTop: spacing.lg,
  },
  loading: {
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.lg,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 11,
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
  note: {
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 18,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
  },
});
