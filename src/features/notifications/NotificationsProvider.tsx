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
import { useRouter } from 'expo-router';

import { useAuth } from '../auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../auth/firebase';
import {
  DeviceResponse,
  InboxItem,
  NotificationCategory,
  NotificationPreferences,
  getInbox,
  getNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  patchNotificationPreferences,
} from './api';
import {
  disableDevicePush,
  enableDevicePush,
  ensureRegisteredDevice,
  syncRefreshedPushToken,
} from './device';
import {
  getInitialPushNotification,
  observeForegroundMessages,
  observeNotificationOpens,
  observeTokenRefresh,
  pushRouteData,
  requestPushPermissionAndToken,
  safeNotificationRoute,
} from './messaging';

interface NotificationsContextValue {
  preferences: NotificationPreferences | null;
  device: DeviceResponse | null;
  inbox: InboxItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pushEnabled: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  refreshInbox: () => Promise<void>;
  loadMore: () => Promise<void>;
  setPreference: (category: NotificationCategory, enabled: boolean) => Promise<void>;
  enablePush: () => Promise<boolean>;
  disablePush: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  openNotification: (notification: InboxItem) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'No pudimos sincronizar las notificaciones.';
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAuthenticated, firebaseUser } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledNotificationIds = useRef(new Set<string>());

  const refreshInbox = useCallback(async () => {
    if (!isAuthenticated) {
      setInbox([]);
      setNextCursor(null);
      return;
    }

    const tokens = await getFirebaseSecurityTokens(true);
    const page = await getInbox(tokens, 20);
    const sorted = [...page.items].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    setInbox(sorted);
    setNextCursor(page.nextCursor);
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !firebaseUser) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [registeredDevice, tokens] = await Promise.all([
        ensureRegisteredDevice(firebaseUser.uid),
        getFirebaseSecurityTokens(true),
      ]);
      const [nextPreferences, page] = await Promise.all([
        getNotificationPreferences(tokens),
        getInbox(tokens, 20),
      ]);

      setDevice(registeredDevice);
      setPreferences(nextPreferences);
      setInbox(
        [...page.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
      setNextCursor(page.nextCursor);
    } catch (syncError) {
      setError(errorMessage(syncError));
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, isAuthenticated]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || !isAuthenticated) {
      return;
    }

    const tokens = await getFirebaseSecurityTokens(true);
    const page = await getInbox(tokens, 20, nextCursor);
    setInbox((current) => {
      const merged = new Map(current.map((item) => [item.id, item]));
      page.items.forEach((item) => merged.set(item.id, item));
      return [...merged.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    });
    setNextCursor(page.nextCursor);
  }, [isAuthenticated, nextCursor]);

  const setPreference = useCallback(
    async (category: NotificationCategory, enabled: boolean) => {
      const tokens = await getFirebaseSecurityTokens(true);
      const updated = await patchNotificationPreferences(tokens, {
        [category]: enabled,
      });
      setPreferences(updated);
    },
    [],
  );

  const enablePush = useCallback(async () => {
    if (!firebaseUser) {
      return false;
    }

    setError(null);
    try {
      const token = await requestPushPermissionAndToken();
      if (!token) {
        const disabled = await disableDevicePush(firebaseUser.uid);
        setDevice(disabled);
        return false;
      }

      const enabled = await enableDevicePush(firebaseUser.uid, token);
      setDevice(enabled);
      return true;
    } catch (pushError) {
      setError(errorMessage(pushError));
      return false;
    }
  }, [firebaseUser]);

  const disablePush = useCallback(async () => {
    if (!firebaseUser) {
      return;
    }

    const disabled = await disableDevicePush(firebaseUser.uid);
    setDevice(disabled);
  }, [firebaseUser]);

  const markRead = useCallback(async (notificationId: string) => {
    const tokens = await getFirebaseSecurityTokens(true);
    const updated = await markNotificationRead(tokens, notificationId);
    setInbox((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    const tokens = await getFirebaseSecurityTokens(true);
    const result = await markAllNotificationsRead(tokens);
    setInbox((current) =>
      current.map((item) =>
        item.readAt ? item : { ...item, readAt: result.readAt },
      ),
    );
  }, []);

  const routeFromPush = useCallback(
    async (notificationId?: string, targetValue?: string) => {
      if (notificationId) {
        if (handledNotificationIds.current.has(notificationId)) {
          return;
        }
        handledNotificationIds.current.add(notificationId);
        void markRead(notificationId).catch(() => undefined);
      }

      void refreshInbox().catch(() => undefined);
      const route = safeNotificationRoute(targetValue);
      router.push((route ?? '/home') as never);
    },
    [markRead, refreshInbox, router],
  );

  const openNotification = useCallback(
    async (notification: InboxItem) => {
      await markRead(notification.id);
      const route = safeNotificationRoute(notification.target.value);
      router.push((route ?? '/home') as never);
    },
    [markRead, router],
  );

  useEffect(() => {
    if (!isAuthenticated || !firebaseUser) {
      setPreferences(null);
      setDevice(null);
      setInbox([]);
      setNextCursor(null);
      setError(null);
      return;
    }

    void refresh();
  }, [firebaseUser, isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const unsubscribeForeground = observeForegroundMessages(() => {
      void refreshInbox().catch(() => undefined);
    });
    const unsubscribeOpen = observeNotificationOpens((message) => {
      const data = pushRouteData(message);
      void routeFromPush(data.notificationId, data.targetValue);
    });

    void getInitialPushNotification().then((message) => {
      if (!message) {
        return;
      }
      const data = pushRouteData(message);
      void routeFromPush(data.notificationId, data.targetValue);
    });

    return () => {
      unsubscribeForeground();
      unsubscribeOpen();
    };
  }, [isAuthenticated, refreshInbox, routeFromPush]);

  useEffect(() => {
    if (!firebaseUser || !device?.notificationsEnabled) {
      return;
    }

    return observeTokenRefresh((token) => {
      void syncRefreshedPushToken(firebaseUser.uid, token, device)
        .then(setDevice)
        .catch(() => undefined);
    });
  }, [device, firebaseUser]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      preferences,
      device,
      inbox,
      unreadCount: inbox.filter((item) => !item.readAt).length,
      loading,
      error,
      pushEnabled: Boolean(device?.notificationsEnabled),
      hasMore: Boolean(nextCursor),
      refresh,
      refreshInbox,
      loadMore,
      setPreference,
      enablePush,
      disablePush,
      markRead,
      markAllRead,
      openNotification,
    }),
    [
      device,
      disablePush,
      enablePush,
      error,
      inbox,
      loadMore,
      loading,
      markAllRead,
      markRead,
      nextCursor,
      openNotification,
      preferences,
      refresh,
      refreshInbox,
      setPreference,
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
