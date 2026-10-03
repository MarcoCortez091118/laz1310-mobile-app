import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export interface PushRouteData {
  notificationId?: string;
  targetValue?: string;
}

interface PushMessageData {
  data?: Record<string, string | undefined>;
}

function messagingInstance() {
  return getMessaging();
}

export async function requestPushPermissionAndToken() {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      return null;
    }
  }

  const messaging = messagingInstance();
  const status = await requestPermission(messaging);
  const authorized =
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL;

  if (!authorized) {
    return null;
  }

  await registerDeviceForRemoteMessages(messaging);
  return getToken(messaging);
}

export function observeForegroundMessages(
  listener: (message: PushMessageData) => void | Promise<void>,
) {
  return onMessage(messagingInstance(), listener);
}

export function observeNotificationOpens(
  listener: (message: PushMessageData) => void | Promise<void>,
) {
  return onNotificationOpenedApp(messagingInstance(), listener);
}

export function observeTokenRefresh(listener: (token: string) => void | Promise<void>) {
  return onTokenRefresh(messagingInstance(), listener);
}

export function getInitialPushNotification() {
  return getInitialNotification(messagingInstance());
}

export function pushRouteData(message: PushMessageData): PushRouteData {
  return {
    notificationId:
      typeof message.data?.notificationId === 'string'
        ? message.data.notificationId
        : undefined,
    targetValue:
      typeof message.data?.targetValue === 'string'
        ? message.data.targetValue
        : undefined,
  };
}

export function safeNotificationRoute(value?: string) {
  if (!value) {
    return null;
  }

  if (value === '/home' || value === '/radio' || value === '/dynamics') {
    return value;
  }

  if (
    /^\/dynamics\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(
      value,
    )
  ) {
    return value;
  }

  return null;
}
