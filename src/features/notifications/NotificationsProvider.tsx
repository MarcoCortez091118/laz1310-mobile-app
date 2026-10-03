import Constants from 'expo-constants';
import { Href, useRouter } from 'expo-router';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { ApiError } from '../../api/client';
import { useAuth } from '../auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../auth/firebase';
import {
  DeviceResponse,
  InboxItem,
  NotificationPreferences,
  NotificationPreferencesPatch,
  deleteDevice,
  getInbox,
  getNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  patchNotificationPreferences,
  registerDevice,
  updateDevicePushToken,
} from './api';
import {
  PushPermissionStatus,
  getCurrentFcmToken,
  getPushPermissionStatus,
  initialNotification,
  requestPushPermission,
  subscribeForegroundMessages,
  subscribeNotificationOpened,
  subscribeTokenRefresh,
} from './messaging';
import { parsePushData } from './routing';
import {
  clearDeviceBinding,
  getOrCreateInstallationId,
  getStoredDeviceBinding,
  hasHandledNotification,
  rememberHandledNotification,
  storeDeviceBinding,
} from './storage';

interface ForegroundNotice {
  notificationId: string | null;
  title: string;
  body: string;
}

interface NotificationsContextValue {
  device: DeviceResponse | null;
  preferences: NotificationPreferences | null;
  inbox: InboxItem[];
  nextCursor: string | null;
  unreadCount: number;
  permissionStatus: PushPermissionStatus;
  pushEnabled: boolean;
  loading: boolean;
  error: string | null;
  foregroundNotice: ForegroundNotice | null;
  refreshPreferences: () => Promise<void>;
  updatePreferences: (patch: NotificationPreferencesPatch) => Promise<void>;
  refreshInbox: () => Promise<void>;
  loadMoreInbox: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  enablePush: () => Promise<boolean>;
  disablePush: () => Promise<void>;
  unlinkCurrentDevice: () => Promise<void>;
  dismissForegroundNotice: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function message(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Esta instalación está vinculada a otra cuenta. Cierra sesión correctamente en la cuenta anterior o reinstala la app.';
  }

  return error instanceof Error ? error.message : fallback;
}

function sortedUnique(items: InboxItem[]) {
  const byId = new Map<string, InboxItem>();
  for (const item of items) {
    byId.set(item.id, item);
  }

  return Array.from(byId.values()).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

function deviceMetadata(
  installationId: string,
  locale: string | null,
  timezone: string | null,
) {
  const resolved = Intl.DateTimeFormat().resolvedOptions();

  return {
    installationId,
    platform: Platform.OS as 'android' | 'ios',
    appVersion: Constants.expoConfig?.version ?? '0.1.0',
    osVersion: String(Platform.Version),
    locale: locale || resolved.locale || 'es-US',
    timezone: timezone || resolved.timeZone || 'America/Detroit',
  };
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAuthenticated, firebaseUser, profile } = useAuth();
  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PushPermissionStatus>('unavailable');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foregroundNotice, setForegroundNotice] =
    useState<ForegroundNotice | null>(null);
  const activeUid = firebaseUser?.uid ?? null;
  const operationGeneration = useRef(0);

  const withTokens = useCallback(async () => {
    if (!isAuthenticated || !activeUid) {
      throw new Error('Inicia sesión para usar las notificaciones de LA Z.');
    }
    return getFirebaseSecurityTokens(true);
  }, [activeUid, isAuthenticated]);

  const refreshPreferences = useCallback(async () => {
    const tokens = await withTokens();
    setPreferences(await getNotificationPreferences(tokens));
  }, [withTokens]);

  const updatePreferences = useCallback(
    async (patch: NotificationPreferencesPatch) => {
      if (Object.keys(patch).length === 0) {
        return;
      }

      setError(null);
      const tokens = await withTokens();
      const updated = await patchNotificationPreferences(tokens, patch);
      setPreferences(updated);
    },
    [withTokens],
  );

  const refreshInbox = useCallback(async () => {
    const tokens = await withTokens();
    const page = await getInbox(tokens, 20);
    setInbox(sortedUnique(page.items));
    setNextCursor(page.nextCursor);
  }, [withTokens]);

  const loadMoreInbox = useCallback(async () => {
    if (!nextCursor) {
      return;
    }

    const tokens = await withTokens();
    const page = await getInbox(tokens, 20, nextCursor);
    setInbox((current) => sortedUnique([...current, ...page.items]));
    setNextCursor(page.nextCursor);
  }, [nextCursor, withTokens]);

  const markRead = useCallback(
    async (notificationId: string) => {
      const tokens = await withTokens();
      const updated = await markNotificationRead(tokens, notificationId);
      setInbox((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
    [withTokens],
  );

  const markAllRead = useCallback(async () => {
    const tokens = await withTokens();
    const result = await markAllNotificationsRead(tokens);
    setInbox((current) =>
      current.map((item) =>
        item.readAt ? item : { ...item, readAt: result.readAt },
      ),
    );
  }, [withTokens]);

  const synchronizePushState = useCallback(
    async (registered: DeviceResponse) => {
      const status = await getPushPermissionStatus();
      setPermissionStatus(status);

      if (!registered.notificationsEnabled) {
        return registered;
      }

      const tokens = await withTokens();
      if (status !== 'granted') {
        const disabled = await updateDevicePushToken(tokens, registered.id, {
          notificationsEnabled: false,
        });
        setDevice(disabled);
        return disabled;
      }

      const fcmToken = await getCurrentFcmToken();
      const refreshed = await updateDevicePushToken(tokens, registered.id, {
        nativePushToken: fcmToken,
        nativePushProvider: 'fcm',
        notificationsEnabled: true,
      });
      setDevice(refreshed);
      return refreshed;
    },
    [withTokens],
  );

  const ensureDevice = useCallback(async () => {
    if (!profile || !activeUid || Platform.OS === 'web') {
      return null;
    }

    const installationId = await getOrCreateInstallationId();
    const tokens = await withTokens();
    const registered = await registerDevice(
      tokens,
      deviceMetadata(installationId, profile.locale, profile.timezone),
    );

    await storeDeviceBinding({
      firebaseUid: activeUid,
      deviceId: registered.id,
    });
    setDevice(registered);
    return synchronizePushState(registered);
  }, [activeUid, profile, synchronizePushState, withTokens]);

  const enablePush = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let registered = device;
      if (!registered) {
        registered = await ensureDevice();
      }
      if (!registered) {
        throw new Error('No pudimos registrar este dispositivo.');
      }

      const status = await requestPushPermission();
      setPermissionStatus(status);
      if (status !== 'granted') {
        const tokens = await withTokens();
        const disabled = await updateDevicePushToken(tokens, registered.id, {
          notificationsEnabled: false,
        });
        setDevice(disabled);
        return false;
      }

      const fcmToken = await getCurrentFcmToken();
      const tokens = await withTokens();
      const updated = await updateDevicePushToken(tokens, registered.id, {
        nativePushToken: fcmToken,
        nativePushProvider: 'fcm',
        notificationsEnabled: true,
      });
      setDevice(updated);
      return true;
    } catch (enableError) {
      setError(message(enableError, 'No pudimos activar las notificaciones.'));
      throw enableError;
    } finally {
      setLoading(false);
    }
  }, [device, ensureDevice, withTokens]);

  const disablePush = useCallback(async () => {
    if (!device) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tokens = await withTokens();
      const updated = await updateDevicePushToken(tokens, device.id, {
        notificationsEnabled: false,
      });
      setDevice(updated);
      setPermissionStatus(await getPushPermissionStatus());
    } catch (disableError) {
      setError(message(disableError, 'No pudimos desactivar las notificaciones.'));
      throw disableError;
    } finally {
      setLoading(false);
    }
  }, [device, withTokens]);

  const unlinkCurrentDevice = useCallback(async () => {
    if (!activeUid) {
      return;
    }

    const stored = await getStoredDeviceBinding(activeUid);
    const deviceId = device?.id ?? stored?.deviceId;
    if (!deviceId) {
      return;
    }

    setError(null);
    const tokens = await withTokens();
    await deleteDevice(tokens, deviceId);
    await clearDeviceBinding(activeUid);
    operationGeneration.current += 1;
    setDevice(null);
    setInbox([]);
    setNextCursor(null);
    setPreferences(null);
  }, [activeUid, device?.id, withTokens]);

  const handleOpenedMessage = useCallback(
    async (data: Record<string, unknown> | undefined) => {
      if (!activeUid) {
        return;
      }

      const parsed = parsePushData(data);
      if (!parsed) {
        router.push('/notifications' as Href);
        return;
      }

      if (await hasHandledNotification(activeUid, parsed.notificationId)) {
        return;
      }
      await rememberHandledNotification(activeUid, parsed.notificationId);

      try {
        await markRead(parsed.notificationId);
      } catch {
        // Navigation remains available when the inbox entry expired or the network is offline.
      }

      router.push(parsed.route as Href);
    },
    [activeUid, markRead, router],
  );

  useEffect(() => {
    if (!isAuthenticated || !activeUid || !profile) {
      operationGeneration.current += 1;
      setDevice(null);
      setPreferences(null);
      setInbox([]);
      setNextCursor(null);
      setForegroundNotice(null);
      return;
    }

    const generation = ++operationGeneration.current;
    setLoading(true);
    setError(null);

    void Promise.all([ensureDevice(), refreshPreferences(), refreshInbox()])
      .catch((bootstrapError) => {
        if (generation === operationGeneration.current) {
          setError(
            message(
              bootstrapError,
              'No pudimos sincronizar las notificaciones de LA Z.',
            ),
          );
        }
      })
      .finally(() => {
        if (generation === operationGeneration.current) {
          setLoading(false);
        }
      });
  }, [
    activeUid,
    ensureDevice,
    isAuthenticated,
    profile,
    refreshInbox,
    refreshPreferences,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !activeUid || Platform.OS === 'web') {
      return;
    }

    const unsubscribeToken = subscribeTokenRefresh((token) => {
      if (!device?.notificationsEnabled) {
        return;
      }

      void withTokens()
        .then((tokens) =>
          updateDevicePushToken(tokens, device.id, {
            nativePushToken: token,
            nativePushProvider: 'fcm',
            notificationsEnabled: true,
          }),
        )
        .then(setDevice)
        .catch((refreshError) => {
          setError(
            message(refreshError, 'No pudimos renovar el registro de notificaciones.'),
          );
        });
    });

    const unsubscribeForeground = subscribeForegroundMessages((remoteMessage) => {
      const parsed = parsePushData(remoteMessage.data);
      setForegroundNotice({
        notificationId: parsed?.notificationId ?? null,
        title: remoteMessage.notification?.title ?? 'LA Z 1310',
        body: remoteMessage.notification?.body ?? 'Tienes una nueva notificación.',
      });
      void refreshInbox().catch(() => {
        // The foreground message itself remains visible if the inbox refresh fails.
      });
    });

    const unsubscribeOpened = subscribeNotificationOpened((remoteMessage) => {
      void handleOpenedMessage(remoteMessage.data);
    });

    void initialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        void handleOpenedMessage(remoteMessage.data);
      }
    });

    return () => {
      unsubscribeToken();
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [
    activeUid,
    device?.id,
    device?.notificationsEnabled,
    handleOpenedMessage,
    isAuthenticated,
    refreshInbox,
    withTokens,
  ]);

  const unreadCount = useMemo(
    () => inbox.filter((item) => !item.readAt).length,
    [inbox],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      device,
      preferences,
      inbox,
      nextCursor,
      unreadCount,
      permissionStatus,
      pushEnabled: Boolean(
        device?.notificationsEnabled && permissionStatus === 'granted',
      ),
      loading,
      error,
      foregroundNotice,
      refreshPreferences,
      updatePreferences,
      refreshInbox,
      loadMoreInbox,
      markRead,
      markAllRead,
      enablePush,
      disablePush,
      unlinkCurrentDevice,
      dismissForegroundNotice: () => setForegroundNotice(null),
    }),
    [
      device,
      disablePush,
      enablePush,
      error,
      foregroundNotice,
      inbox,
      loadMoreInbox,
      loading,
      markAllRead,
      markRead,
      nextCursor,
      permissionStatus,
      preferences,
      refreshInbox,
      refreshPreferences,
      unlinkCurrentDevice,
      unreadCount,
      updatePreferences,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return value;
}
