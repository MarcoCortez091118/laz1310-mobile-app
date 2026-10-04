import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { getFirebaseSecurityTokens } from '../../../src/features/auth/firebase';
import {
  getNotificationPreferences,
  patchNotificationPreferences,
  type NotificationPreferences,
} from '../../../src/features/notifications/api';
import { usePushNotifications } from '../../../src/features/notifications/PushNotificationsProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

const categories: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: 'general',
    title: 'General',
    description: 'Avisos importantes de LA Z 1310.',
    icon: 'notifications-outline',
  },
  {
    key: 'radio',
    title: 'Radio',
    description: 'En vivo, programación especial y novedades de la estación.',
    icon: 'radio-outline',
  },
  {
    key: 'programs',
    title: 'Programas',
    description: 'Actualizaciones de shows y programación.',
    icon: 'calendar-outline',
  },
  {
    key: 'dynamics',
    title: 'Dinámicas',
    description: 'Concursos, promociones y oportunidades de participación.',
    icon: 'sparkles-outline',
  },
];

export default function NotificationSettingsScreen() {
  const { colors } = useAppTheme();
  const push = usePushNotifications();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [updating, setUpdating] = useState<keyof NotificationPreferences | null>(
    null,
  );
  const [preferenceError, setPreferenceError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingPreferences(true);
    void getFirebaseSecurityTokens(true)
      .then((tokens) => getNotificationPreferences(tokens))
      .then((data) => {
        if (active) {
          setPreferences(data);
          setPreferenceError(null);
        }
      })
      .catch((error) => {
        if (active) {
          setPreferenceError(
            error instanceof Error
              ? error.message
              : 'No pudimos cargar tus preferencias.',
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPreferences(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateCategory(
    key: keyof NotificationPreferences,
    value: boolean,
  ) {
    if (!preferences) return;
    const previous = preferences;
    setUpdating(key);
    setPreferenceError(null);
    setPreferences({ ...preferences, [key]: value });
    try {
      const tokens = await getFirebaseSecurityTokens(true);
      const updated = await patchNotificationPreferences(tokens, {
        [key]: value,
      });
      setPreferences(updated);
    } catch (error) {
      setPreferences(previous);
      setPreferenceError(
        error instanceof Error
          ? error.message
          : 'No pudimos guardar esta preferencia.',
      );
    } finally {
      setUpdating(null);
    }
  }

  async function togglePush(value: boolean) {
    setPreferenceError(null);
    try {
      if (value) await push.enable();
      else await push.disable();
    } catch (error) {
      setPreferenceError(
        error instanceof Error
          ? error.message
          : 'No pudimos actualizar las notificaciones de este dispositivo.',
      );
    }
  }

  const pushBusy = push.status === 'syncing';

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Notificaciones" />

        <Text style={[styles.title, { color: colors.white }]}>Preferencias</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Decide qué mensajes quieres recibir. Tus preferencias se validan en la
          API antes de cada envío.
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
          <View style={styles.row}>
            <View
              style={[styles.icon, { backgroundColor: 'rgba(211,10,18,0.12)' }]}
            >
              <Ionicons
                color={colors.red}
                name="phone-portrait-outline"
                size={21}
              />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>Push en este dispositivo</Text>
              <Text style={[styles.rowDescription, { color: colors.muted }]}>
                Registra este teléfono con FCM para recibir alertas del sistema.
              </Text>
            </View>
            {pushBusy ? (
              <ActivityIndicator color={colors.red} size="small" />
            ) : (
              <Switch
                onValueChange={(value) => void togglePush(value)}
                trackColor={{ false: colors.border, true: colors.red }}
                value={push.enabled}
              />
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.muted }]}>PERMISO DEL SISTEMA</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    push.permission === 'authorized'
                      ? '#56C985'
                      : push.permission === 'denied'
                        ? colors.red
                        : colors.muted,
                },
              ]}
            >
              {push.permission === 'authorized'
                ? 'AUTORIZADO'
                : push.permission === 'denied'
                  ? 'DENEGADO'
                  : 'PENDIENTE'}
            </Text>
          </View>

          {push.permission === 'denied' ? (
            <Text
              onPress={() => void Linking.openSettings()}
              style={[styles.settingsLink, { color: colors.red }]}
            >
              Abrir configuración del sistema
            </Text>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.white }]}>Categorías</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          {loadingPreferences ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.red} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>Cargando preferencias…</Text>
            </View>
          ) : preferences ? (
            categories.map((category, index) => (
              <View key={category.key}>
                {index > 0 ? (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                ) : null}
                <View style={styles.row}>
                  <View style={styles.copy}>
                    <View style={styles.categoryTitleRow}>
                      <Ionicons color={colors.red} name={category.icon} size={18} />
                      <Text style={[styles.rowTitle, { color: colors.white }]}>{category.title}</Text>
                    </View>
                    <Text style={[styles.rowDescription, { color: colors.muted }]}>{category.description}</Text>
                  </View>
                  {updating === category.key ? (
                    <ActivityIndicator color={colors.red} size="small" />
                  ) : (
                    <Switch
                      onValueChange={(value) =>
                        void updateCategory(category.key, value)
                      }
                      trackColor={{ false: colors.border, true: colors.red }}
                      value={preferences[category.key]}
                    />
                  )}
                </View>
              </View>
            ))
          ) : null}
        </View>

        {preferenceError || push.error ? (
          <View
            style={[
              styles.error,
              { borderColor: colors.red, backgroundColor: 'rgba(211,10,18,0.08)' },
            ]}
          >
            <Ionicons color={colors.red} name="alert-circle-outline" size={19} />
            <Text style={[styles.errorText, { color: colors.white }]}>
              {preferenceError ?? push.error}
            </Text>
          </View>
        ) : null}

        <View style={styles.note}>
          <Ionicons color={colors.muted} name="shield-checkmark-outline" size={18} />
          <Text style={[styles.noteText, { color: colors.muted }]}>
            El token FCM se registra directamente con LA Z API y nunca se muestra
            en tu perfil. Desactivar push elimina el token activo del registro del
            dispositivo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 64,
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
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
    marginTop: 26,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 14,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 82,
    paddingVertical: 12,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
  },
  categoryTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rowTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  rowDescription: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  divider: { height: 1 },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  statusLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  statusValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  settingsLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    paddingBottom: 14,
    paddingTop: 8,
  },
  loading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 82,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  error: {
    alignItems: 'flex-start',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
  },
  note: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 14,
  },
});
