import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getFirebaseSecurityTokens } from '../auth/firebase';
import {
  DeviceResponse,
  deleteDevice,
  registerDevice,
  updatePushToken,
} from './api';

const INSTALLATION_ID_KEY = '@laz1310/installation-id';
const DEVICE_ID_PREFIX = '@laz1310/device-id/';

function randomSegment() {
  return Math.random().toString(36).slice(2, 12);
}

async function installationId() {
  const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) {
    return existing;
  }

  const value = `laz-${Date.now().toString(36)}-${randomSegment()}-${randomSegment()}`;
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, value);
  return value;
}

function deviceIdKey(firebaseUid: string) {
  return DEVICE_ID_PREFIX + firebaseUid;
}

function deviceDefaults() {
  const resolved = Intl.DateTimeFormat().resolvedOptions();

  return {
    platform: Platform.OS === 'ios' ? ('ios' as const) : ('android' as const),
    appVersion: Constants.expoConfig?.version ?? '0.1.0',
    locale: resolved.locale || undefined,
    timezone: resolved.timeZone || undefined,
  };
}

export async function ensureRegisteredDevice(firebaseUid: string) {
  const tokens = await getFirebaseSecurityTokens(true);
  const registered = await registerDevice(tokens, {
    installationId: await installationId(),
    ...deviceDefaults(),
  });

  await AsyncStorage.setItem(deviceIdKey(firebaseUid), registered.id);
  return registered;
}

export async function getStoredDeviceId(firebaseUid: string) {
  return AsyncStorage.getItem(deviceIdKey(firebaseUid));
}

export async function enableDevicePush(
  firebaseUid: string,
  nativePushToken: string,
) {
  const deviceId =
    (await getStoredDeviceId(firebaseUid)) ??
    (await ensureRegisteredDevice(firebaseUid)).id;
  const tokens = await getFirebaseSecurityTokens(true);

  return updatePushToken(tokens, deviceId, {
    nativePushToken,
    nativePushProvider: 'fcm',
    notificationsEnabled: true,
  });
}

export async function disableDevicePush(firebaseUid: string) {
  const deviceId = await getStoredDeviceId(firebaseUid);
  if (!deviceId) {
    return ensureRegisteredDevice(firebaseUid);
  }

  const tokens = await getFirebaseSecurityTokens(true);
  return updatePushToken(tokens, deviceId, {
    notificationsEnabled: false,
  });
}

export async function unlinkCurrentDevice(firebaseUid: string) {
  const key = deviceIdKey(firebaseUid);
  const deviceId = await AsyncStorage.getItem(key);
  if (!deviceId) {
    return;
  }

  const tokens = await getFirebaseSecurityTokens(true);
  await deleteDevice(tokens, deviceId);
  await AsyncStorage.removeItem(key);
}

export async function syncRefreshedPushToken(
  firebaseUid: string,
  token: string,
  currentDevice?: DeviceResponse | null,
) {
  if (currentDevice && !currentDevice.notificationsEnabled) {
    return currentDevice;
  }

  return enableDevicePush(firebaseUid, token);
}
