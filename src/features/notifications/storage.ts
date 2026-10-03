import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLATION_ID_KEY = '@laz1310/notifications/installation-id/v1';
const DEVICE_KEY_PREFIX = '@laz1310/notifications/device/v1/';
const HANDLED_KEY_PREFIX = '@laz1310/notifications/handled/v1/';
const MAX_HANDLED_IDS = 50;

export interface StoredDeviceBinding {
  firebaseUid: string;
  deviceId: string;
}

function newInstallationId() {
  const random = Array.from({ length: 4 }, () =>
    Math.random().toString(36).slice(2, 10),
  ).join('-');

  return `laz-${Date.now().toString(36)}-${random}`;
}

export async function getOrCreateInstallationId() {
  const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) {
    return existing;
  }

  const created = newInstallationId();
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, created);
  return created;
}

function deviceKey(firebaseUid: string) {
  return DEVICE_KEY_PREFIX + firebaseUid;
}

export async function getStoredDeviceBinding(firebaseUid: string) {
  const raw = await AsyncStorage.getItem(deviceKey(firebaseUid));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredDeviceBinding;
    return parsed.firebaseUid === firebaseUid && parsed.deviceId
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function storeDeviceBinding(binding: StoredDeviceBinding) {
  await AsyncStorage.setItem(
    deviceKey(binding.firebaseUid),
    JSON.stringify(binding),
  );
}

export async function clearDeviceBinding(firebaseUid: string) {
  await AsyncStorage.removeItem(deviceKey(firebaseUid));
}

function handledKey(firebaseUid: string) {
  return HANDLED_KEY_PREFIX + firebaseUid;
}

export async function hasHandledNotification(
  firebaseUid: string,
  notificationId: string,
) {
  const raw = await AsyncStorage.getItem(handledKey(firebaseUid));
  if (!raw) {
    return false;
  }

  try {
    const values = JSON.parse(raw) as string[];
    return Array.isArray(values) && values.includes(notificationId);
  } catch {
    return false;
  }
}

export async function rememberHandledNotification(
  firebaseUid: string,
  notificationId: string,
) {
  const key = handledKey(firebaseUid);
  const raw = await AsyncStorage.getItem(key);
  let values: string[] = [];

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        values = parsed.filter((item) => typeof item === 'string');
      }
    } catch {
      values = [];
    }
  }

  values = [notificationId, ...values.filter((id) => id !== notificationId)].slice(
    0,
    MAX_HANDLED_IDS,
  );
  await AsyncStorage.setItem(key, JSON.stringify(values));
}
