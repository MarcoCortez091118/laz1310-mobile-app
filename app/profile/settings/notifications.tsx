import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import {
  NotificationCategory,
} from '../../../src/features/notifications/api';
import { useNotifications } from '../../../src/features/notifications/NotificationsProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

const rows: Array<{
  key: NotificationCategory;
  title: string;
  subtitle: string;
}> = [
  {
    key: 'general',
    title: 'General',
    subtitle: 'Avisos importantes de LA Z y de tu cuenta.',
  },
  {
    key: 'radio',
    title: 'Radio',
    subtitle: 'Alertas relacionadas con transmisiones en vivo.',
  },
  {
    key: 'programs',
    title: 'Programas',
    subtitle: 'Novedades y recordatorios de programación.',
  },
  {
    key: 'dynamics',
    title: 'Dinámicas',
    subtitle: 'Concursos, promociones y nuevas participaciones.',
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const {
    preferences,
    pushEnabled,
    loading,
    error,
    refresh,
    setPreference,
    enablePush,
    disablePush,
  } = useNotifications();
  const { colors } = useAppTheme();
  const [savingCategory, setSavingCategory] = useState<NotificationCategory | null>(null);
  const [changingPush, setChangingPush] = useState(false);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  const togglePreference = async (
    category: NotificationCategory,
    enabled: boolean,
  ) => {
    setSavingCategory(category);
    try {
      await setPreference(category, enabled);
    } finally {
      setSavingCategory(null);
    }
  };

  const togglePush = async (enabled: boolean) => {
    setChangingPush(true);
    try {
      if (enabled) {
        await enablePush();
      } else {
        await disablePush();
      }
    } finally {
      setChangingPush(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <View style={styles.content}>
        <ScreenHeader title="Notificaciones" />

        <Text style={[styles.title, { color: colors.white }]}>Tus avisos</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}> 
          El permiso push del teléfono y las categorías son configuraciones independientes.
        </Text>

        <View
          style={[
            styles.pushCard,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: colors.white }]}>Push en este dispositivo</Text>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}> 
              {pushEnabled
                ? 'Este teléfono está registrado para recibir FCM.'
                : 'Actívalo para solicitar permiso y registrar el token FCM.'}
            </Text>
          </View>
          <Switch
            disabled={changingPush || loading}
            onValueChange={(value) => void togglePush(value)}
            value={pushEnabled}
          />
        </View>

        <View style={styles.rows}>
          {rows.map((row) => (
            <View
              key={row.key}
              style={[
                styles.row,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <View style={styles.copy}>
                <Text style={[styles.rowTitle, { color: colors.white }]}>{row.title}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{row.subtitle}</Text>
              </View>
              <Switch
                disabled={!preferences || savingCategory === row.key}
                onValueChange={(value) => void togglePreference(row.key, value)}
                value={preferences?.[row.key] ?? false}
              />
            </View>
          ))}
        </View>

        {loading ? <ActivityIndicator style={styles.loader} color={colors.red} /> : null}
        {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

        <Pressable onPress={() => void refresh()} style={styles.refresh}>
          <Text style={[styles.refreshText, { color: colors.red }]}>Actualizar estado</Text>
        </Pressable>
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
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  rows: { gap: 10, marginTop: 12 },
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    padding: spacing.md,
  },
  copy: { flex: 1, paddingRight: 12 },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  loader: { marginTop: spacing.md },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
  },
  refresh: { alignSelf: 'flex-start', marginTop: spacing.md, paddingVertical: 8 },
  refreshText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
