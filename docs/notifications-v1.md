# Notifications V1 — Mobile

LA Z Mobile uses Firebase Cloud Messaging for native push delivery while FastAPI remains the source of truth for device registration, notification preferences and the in-app inbox.

## Flow

```text
Firebase Auth + App Check
        ↓
POST /api/v1/auth/session
        ↓
POST /api/v1/devices
        ↓
explicit user push action
        ↓
OS notification permission
        ↓
Firebase Messaging FCM token
        ↓
PUT /api/v1/devices/{device_id}/push-token
        ↓
FastAPI / Firestore
```

The installation is registered after the business session is available. Push permission is never requested automatically during sign-in.

## Profile interests

`PATCH /api/v1/me` supports these content interests:

- `radio`
- `news`
- `events`
- `shows`
- `community`

They are independent from notification preferences.

## Notification preferences

`GET/PATCH /api/v1/me/notification-preferences` manages:

- `general`
- `radio`
- `programs`
- `dynamics`

The device-level `notificationsEnabled` state is separate from all four categories.

## Device lifecycle

A random installation ID is persisted in AsyncStorage. It is not a hardware identifier. The device ID returned by FastAPI is stored per Firebase UID.

Enabling push sends a native FCM token with:

```json
{
  "nativePushToken": "<FCM token>",
  "nativePushProvider": "fcm",
  "notificationsEnabled": true
}
```

Disabling push sends only `notificationsEnabled=false`; the backend owns token cleanup.

FCM token refresh is synchronized while push remains enabled.

Sign-out unlinks the device before Firebase Auth is closed so the request still has valid Firebase ID token and App Check credentials.

## Inbox and routing

The Notification Center consumes:

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/{notification_id}/read`
- `POST /api/v1/notifications/read-all`

Push navigation uses only the server allowlist:

- `/home`
- `/radio`
- `/dynamics`
- `/dynamics/{uuid}`

Unknown targets fall back to `/home`. Push opens are deduplicated by `notificationId` during the current app process.

## Native build impact

`@react-native-firebase/messaging` adds native code, so an existing Development Build cannot load this integration. Generate and install a new APK after merging this change:

```bash
npx eas-cli@latest build --platform android --profile development
```

After installing the APK, normal development continues with:

```bash
npx expo start --dev-client -c
```

For iOS the app config includes the APNs entitlement and `remote-notification` background mode. Firebase/APNs credentials must still be configured in Firebase/Apple before end-to-end iOS delivery is expected.

## Physical acceptance

1. Sign in and confirm the installation is registered once.
2. Open Profile and persist content interests.
3. Open Settings → Notifications and verify all four server-backed categories.
4. Enable push and accept the OS permission.
5. Confirm the backend device has `nativePushProvider=fcm` and `notificationsEnabled=true`.
6. Send a test notification from the admin/backend flow.
7. Verify foreground inbox refresh.
8. Verify background tap routing.
9. Kill the app and verify cold-start tap routing.
10. Mark one item and all items as read.
11. Disable push and confirm the device is disabled without changing categories.
12. Sign out and confirm the device is unlinked.
13. Regression-test radio/background playback.
