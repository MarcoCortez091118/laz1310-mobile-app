import { apiRequest } from '../../api/client';
import { firebaseAuthHeaders } from '../auth/api';
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

export interface DeviceRegistrationPayload {
  installationId: string;
  platform: 'android' | 'ios';
  appVersion: string;
  deviceModel?: string;
  osVersion?: string;
  locale?: string;
  timezone?: string;
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
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  nativePushProvider: string | null;
}

export interface PushTokenPayload {
  nativePushToken?: string;
  nativePushProvider?: 'fcm' | 'apns';
  notificationsEnabled: boolean;
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

export function getNotificationPreferences(tokens: FirebaseSecurityTokens) {
  return apiRequest<NotificationPreferences>(
    '/api/v1/me/notification-preferences',
    { headers: firebaseAuthHeaders(tokens) },
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
      headers: firebaseAuthHeaders(tokens),
      body: JSON.stringify(payload),
    },
  );
}

export function registerDevice(
  tokens: FirebaseSecurityTokens,
  payload: DeviceRegistrationPayload,
) {
  return apiRequest<DeviceResponse>('/api/v1/devices', {
    method: 'POST',
    headers: firebaseAuthHeaders(tokens),
    body: JSON.stringify(payload),
  });
}

export function updateDevicePushToken(
  tokens: FirebaseSecurityTokens,
  deviceId: string,
  payload: PushTokenPayload,
) {
  return apiRequest<DeviceResponse>(
    `/api/v1/devices/${encodeURIComponent(deviceId)}/push-token`,
    {
      method: 'PUT',
      headers: firebaseAuthHeaders(tokens),
      body: JSON.stringify(payload),
    },
  );
}

export function deleteDevice(
  tokens: FirebaseSecurityTokens,
  deviceId: string,
) {
  return apiRequest<void>(`/api/v1/devices/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE',
    headers: firebaseAuthHeaders(tokens),
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
    headers: firebaseAuthHeaders(tokens),
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
      headers: firebaseAuthHeaders(tokens),
    },
  );
}

export function markAllNotificationsRead(tokens: FirebaseSecurityTokens) {
  return apiRequest<ReadAllResponse>('/api/v1/notifications/read-all', {
    method: 'POST',
    headers: firebaseAuthHeaders(tokens),
  });
}
