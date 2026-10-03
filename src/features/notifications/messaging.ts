import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  hasPermission,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export type PushPermissionStatus =
  | 'unavailable'
  | 'notDetermined'
  | 'denied'
  | 'granted';

function nativeMessaging() {
  if (Platform.OS === 'web') {
    throw new Error('Push notifications are available only in native LA Z builds');
  }

  return getMessaging();
}

function iosStatus(status: number): PushPermissionStatus {
  if (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  ) {
    return 'granted';
  }

  if (status === AuthorizationStatus.NOT_DETERMINED) {
    return 'notDetermined';
  }

  return 'denied';
}

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (Platform.OS === 'web') {
    return 'unavailable';
  }

  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) {
      return 'granted';
    }

    return (await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ))
      ? 'granted'
      : 'denied';
  }

  return iosStatus(await hasPermission(nativeMessaging()));
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  if (Platform.OS === 'web') {
    return 'unavailable';
  }

  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) {
      return 'granted';
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  }

  const status = await requestPermission(nativeMessaging(), {
    alert: true,
    badge: true,
    sound: true,
  });
  return iosStatus(status);
}

export async function getCurrentFcmToken() {
  const messaging = nativeMessaging();
  await registerDeviceForRemoteMessages(messaging);
  return getToken(messaging);
}

export function subscribeTokenRefresh(listener: (token: string) => void) {
  if (Platform.OS === 'web') {
    return () => {};
  }

  return onTokenRefresh(nativeMessaging(), listener);
}

export function subscribeForegroundMessages(
  listener: (message: RemoteMessage) => void,
) {
  if (Platform.OS === 'web') {
    return () => {};
  }

  return onMessage(nativeMessaging(), listener);
}

export function subscribeNotificationOpened(
  listener: (message: RemoteMessage) => void,
) {
  if (Platform.OS === 'web') {
    return () => {};
  }

  return onNotificationOpenedApp(nativeMessaging(), listener);
}

export async function initialNotification() {
  if (Platform.OS === 'web') {
    return null;
  }

  return getInitialNotification(nativeMessaging());
}
