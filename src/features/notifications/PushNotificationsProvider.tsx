import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { Href, useRouter } from 'expo-router';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { useAppTheme } from '../../theme/ThemeProvider';
import { fonts, radii, spacing } from '../../theme/tokens';
import {
  currentPushPermission,
  disablePushForDevice,
  enablePushForDevice,
  locallyEnabled,
  registerCurrentInstallation,
  syncPushToken,
  type PushPermissionState,
} from './device';

interface ForegroundPush {
  title: string;
  body: string;
  target: Href | null;
}

type PushStatus = 'idle' | 'syncing' | 'ready' | 'error';

interface PushNotificationsContextValue {
  status: PushStatus;
  enabled: boolean;
  permission: PushPermissionState;
  deviceId: string | null;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  refresh: () => Promise<void>;
}

const PushNotificationsContext =
  createContext<PushNotificationsContextValue | null>(null);

function notificationTarget(value: unknown): Href | null {
  if (value === '/home' || value === '/radio' || value === '/dynamics') {
    return value;
  }
  if (
    typeof value === 'string' &&
    /^\/dynamics\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return value as Href;
  }
  return null;
}

export function PushNotificationsProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { colors } = useAppTheme();
  const [status, setStatus] = useState<PushStatus>('idle');
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] =
    useState<PushPermissionState>('not-determined');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foregroundPush, setForegroundPush] =
    useState<ForegroundPush | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !profile || Platform.OS === 'web') {
      setStatus('idle');
      setEnabled(false);
      setDeviceId(null);
      return;
    }

    setStatus('syncing');
    setError(null);
    try {
      const device = await registerCurrentInstallation({
        locale: profile.locale,
        timezone: profile.timezone,
      });
      setDeviceId(device.id);

      const nextPermission = await currentPushPermission();
      const shouldEnable = await locallyEnabled();
      setPermission(nextPermission);

      if (shouldEnable && nextPermission === 'authorized') {
        const synced = await syncPushToken(device.id);
        setEnabled(Boolean(synced?.notificationsEnabled));
      } else if (shouldEnable && nextPermission !== 'authorized') {
        await syncPushToken(device.id);
        setEnabled(false);
      } else {
        setEnabled(device.notificationsEnabled && nextPermission === 'authorized');
      }
      setStatus('ready');
    } catch (syncError) {
      setStatus('error');
      setEnabled(false);
      setError(
        syncError instanceof Error
          ? syncError.message
          : 'No pudimos registrar este dispositivo para notificaciones.',
      );
    }
  }, [isAuthenticated, profile]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!deviceId || !enabled || Platform.OS === 'web') return;
    const service = getMessaging(getApp());
    return onTokenRefresh(service, (token) => {
      void syncPushToken(deviceId, token).catch((refreshError) => {
        setStatus('error');
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : 'No pudimos renovar el token FCM.',
        );
      });
    });
  }, [deviceId, enabled]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const service = getMessaging(getApp());

    const openTarget = (value: unknown) => {
      const target = notificationTarget(value);
      if (target) router.push(target);
    };

    const unsubscribeMessage = onMessage(service, (message) => {
      const title = message.notification?.title ?? 'LA Z 1310';
      const body = message.notification?.body ?? '';
      setForegroundPush({
        title,
        body,
        target: notificationTarget(message.data?.targetValue),
      });
    });
    const unsubscribeOpened = onNotificationOpenedApp(service, (message) => {
      openTarget(message.data?.targetValue);
    });
    void getInitialNotification(service).then((message) => {
      if (message) openTarget(message.data?.targetValue);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeOpened();
    };
  }, [router]);

  const enable = useCallback(async () => {
    if (!isAuthenticated || !profile) {
      throw new Error('Inicia sesión para activar las notificaciones.');
    }
    setStatus('syncing');
    setError(null);
    try {
      const device = deviceId
        ? { id: deviceId }
        : await registerCurrentInstallation({
            locale: profile.locale,
            timezone: profile.timezone,
          });
      setDeviceId(device.id);
      const updated = await enablePushForDevice(device.id);
      setEnabled(updated.notificationsEnabled);
      setPermission('authorized');
      setStatus('ready');
    } catch (enableError) {
      setPermission(await currentPushPermission());
      setStatus('error');
      setEnabled(false);
      const message =
        enableError instanceof Error
          ? enableError.message
          : 'No pudimos activar las notificaciones.';
      setError(message);
      throw enableError;
    }
  }, [deviceId, isAuthenticated, profile]);

  const disable = useCallback(async () => {
    setStatus('syncing');
    setError(null);
    try {
      if (deviceId) await disablePushForDevice(deviceId);
      setEnabled(false);
      setPermission(await currentPushPermission());
      setStatus('ready');
    } catch (disableError) {
      setStatus('error');
      const message =
        disableError instanceof Error
          ? disableError.message
          : 'No pudimos desactivar las notificaciones.';
      setError(message);
      throw disableError;
    }
  }, [deviceId]);

  const value = useMemo<PushNotificationsContextValue>(
    () => ({
      status,
      enabled,
      permission,
      deviceId,
      error,
      enable,
      disable,
      refresh,
    }),
    [deviceId, disable, enable, enabled, error, permission, refresh, status],
  );

  return (
    <PushNotificationsContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {foregroundPush ? (
          <Pressable
            onPress={() => {
              const target = foregroundPush.target;
              setForegroundPush(null);
              if (target) router.push(target);
            }}
            style={[
              styles.banner,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.bannerCopy}>
              <Text style={[styles.bannerTitle, { color: colors.white }]}>
                {foregroundPush.title}
              </Text>
              {foregroundPush.body ? (
                <Text
                  numberOfLines={2}
                  style={[styles.bannerBody, { color: colors.muted }]}
                >
                  {foregroundPush.body}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityLabel="Cerrar notificación"
              hitSlop={10}
              onPress={(event) => {
                event.stopPropagation();
                setForegroundPush(null);
              }}
            >
              <Text style={[styles.close, { color: colors.muted }]}>×</Text>
            </Pressable>
          </Pressable>
        ) : null}
      </View>
    </PushNotificationsContext.Provider>
  );
}

export function usePushNotifications() {
  const value = useContext(PushNotificationsContext);
  if (!value) {
    throw new Error(
      'usePushNotifications must be used within PushNotificationsProvider',
    );
  }
  return value;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  banner: {
    alignItems: 'flex-start',
    borderRadius: radii.md,
    borderWidth: 1,
    elevation: 12,
    flexDirection: 'row',
    left: spacing.md,
    padding: spacing.md,
    position: 'absolute',
    right: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    top: 52,
    zIndex: 1000,
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  bannerBody: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  close: {
    fontFamily: fonts.body,
    fontSize: 24,
    lineHeight: 24,
    marginLeft: 12,
  },
});
