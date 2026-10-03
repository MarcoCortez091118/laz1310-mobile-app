import { apiRequest } from '../../api/client';
import { FirebaseSecurityTokens } from '../auth/firebase';

export type NotificationCategory =
  | 'general'
  | 'radio'
  | 'programs'
  | 'dynamics';

export interface NotificationPreferences {
  general: boolean;
  radio: boolean;
  programs: boolean;
  dynamics: boolean;
}

export type NotificationPreferencesPatch = Partial<NotificationPreferences>;

export interface RegisterDevicePayload {
  installationId: string;
  platform: 'android' | 'ios';
  appVersion: string;
  deviceModel?: string;
  osVersion?: string;
  locale?: string;
  timezone?: string;
}

export interface UpdatePushTokenPayload {
  expoPushToken?: string | null;
  nativePushToken?: string | null;
  nativePushProvider?: 'fcm' | 'apns' | null;
  notificationsEnabled: boolean;
}

export interface DeviceResponse {
  id: string;
  userId: string;
  installationId: string;
  platform: string;
  appVersion: string;
  deviceModel: string | null;
  osVersion: string | null;
  locale: string | null;
  timezone: string | null;
  expoPushToken: string | null;
  nativePushToken: string | null;
  nativePushProvider: string | null;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
}

export interface NotificationTarget {
  kind: 'route';
  value: string;
}

export interface InboxItem {
  id: string;
  type: NotificationCategory;
  title: string;
  body: string;
  target: NotificationTarget;
  createdAt: string;
  readAt: string | null;
}

export interface InboxPage {
  items: InboxItem[];
  nextCursor: string | null;
}

export interface ReadAllResponse {
  readAt: string;
}

function authHeaders(tokens: FirebaseSecurityTokens) {
  if (!tokens.idToken) {
    throw new Error('Firebase ID token is required for this LA Z API request');
  }

  return {
    Authorization: 'Bearer ' + tokens.idToken,
    'X-Firebase-AppCheck': tokens.appCheckToken,
  };
}

export function getNotificationPreferences(tokens: FirebaseSecurityTokens) {
  return apiRequest<NotificationPreferences>(
    '/api/v1/me/notification-preferences',
    { headers: authHeaders(tokens) },
  );
}

export function patchNotificationPreferences(
  tokens: FirebaseSecurityTokens,
  payload: NotificationPreferencesPatch,
) {
  return apiRequest<NotificationPreferences>(
    '/api/v1/me/notification-preferences',
    {
      method: 'PATCH',
      headers: authHeaders(tokens),
      body: JSON.stringify(payload),
    },
  );
}

export function registerDevice(
  tokens: FirebaseSecurityTokens,
  payload: RegisterDevicePayload,
) {
  return apiRequest<DeviceResponse>('/api/v1/devices', {
    method: 'POST',
    headers: authHeaders(tokens),
    body: JSON.stringify(payload),
  });
}

export function updatePushToken(
  tokens: FirebaseSecurityTokens,
  deviceId: string,
  payload: UpdatePushTokenPayload,
) {
  return apiRequest<DeviceResponse>(
    `/api/v1/devices/${encodeURIComponent(deviceId)}/push-token`,
    {
      method: 'PUT',
      headers: authHeaders(tokens),
      body: JSON.stringify(payload),
    },
  );
}

export function deleteDevice(tokens: FirebaseSecurityTokens, deviceId: string) {
  return apiRequest<void>(`/api/v1/devices/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE',
    headers: authHeaders(tokens),
  });
}

export function getInbox(
  tokens: FirebaseSecurityTokens,
  limit = 20,
  after?: string | null,
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) {
    params.set('after', after);
  }

  return apiRequest<InboxPage>(`/api/v1/notifications?${params.toString()}`, {
    headers: authHeaders(tokens),
  });
}

export function markNotificationRead(
  tokens: FirebaseSecurityTokens,
  notificationId: string,
) {
  return apiRequest<InboxItem>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: 'PATCH',
      headers: authHeaders(tokens),
    },
  );
}

export function markAllNotificationsRead(tokens: FirebaseSecurityTokens) {
  return apiRequest<ReadAllResponse>('/api/v1/notifications/read-all', {
    method: 'POST',
    headers: authHeaders(tokens),
  });
}
