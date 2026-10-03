# Notifications V1 + FCM — Mobile

LA Z Mobile uses Firebase Cloud Messaging only as the native delivery transport. User identity, notification preferences, device ownership, inbox state and safe routing remain owned by LA Z FastAPI.

## Architecture

```text
Firebase Authentication
        ↓
ID token + Firebase App Check
        ↓
NotificationsProvider
        ├─ POST /api/v1/devices
        ├─ PUT /api/v1/devices/{device_id}/push-token
        ├─ DELETE /api/v1/devices/{device_id}
        ├─ GET/PATCH /api/v1/me/notification-preferences
        └─ GET/PATCH/POST /api/v1/notifications...
        ↓
LA Z FastAPI
        ↓
Firebase Cloud Messaging
        ↓
Android / iOS
```

Passwords never pass through LA Z FastAPI. Push tokens are never logged by the mobile app.

## Interests vs notification preferences

These are separate product concepts.

`PATCH /api/v1/me` stores content interests:

- `radio`
- `news`
- `events`
- `shows`
- `community`

`GET/PATCH /api/v1/me/notification-preferences` stores delivery categories:

- `general`
- `radio`
- `programs`
- `dynamics`

Changing an interest does not grant push permission and changing a notification category does not alter content interests.

## Device lifecycle

A random installation ID is created once and stored in AsyncStorage. It is not a hardware identifier.

After a valid Firebase + LA Z session, Mobile registers the installation with `POST /api/v1/devices`. Registration itself does not ask for push permission.

When the user explicitly enables push:

1. request the operating-system notification permission;
2. obtain the native FCM token;
3. call `PUT /api/v1/devices/{device_id}/push-token` with `nativePushProvider: "fcm"` and `notificationsEnabled: true`.

When Firebase rotates the token, Mobile updates the same device record. If the operating-system permission is revoked, Mobile synchronizes `notificationsEnabled: false` and the backend clears the token.

A `409` ownership conflict is surfaced to the user. Mobile does not generate a new installation ID to bypass the backend ownership rule.

On explicit logout, Mobile calls `DELETE /api/v1/devices/{device_id}` while the previous Firebase identity is still valid. Firebase sign-out only follows a successful unlink operation.

## Inbox

The Notification Center uses:

```text
GET  /api/v1/notifications?limit=20&after=<cursor>
PATCH /api/v1/notifications/{notification_id}/read
POST /api/v1/notifications/read-all
```

The Home bell opens the Notification Center and displays the current unread count.

## Push routing security

Mobile never executes arbitrary URLs or arbitrary Expo Router paths received from FCM.

Allowed targets are limited to:

```text
/home
/radio
/dynamics
/dynamics/{canonical-lowercase-uuid}
```

Payloads must use schema version `1`, `targetKind=route`, a non-empty `notificationId`, and an allowlisted `targetValue`. Unknown payloads fall back to the Notification Center.

Notification taps are deduplicated locally by `notificationId`. The bounded deduplication history stores only recent notification IDs.

## Foreground, background and cold start

- Foreground: Mobile shows an in-app banner and refreshes the inbox.
- Background tap: RNFirebase delivers the opened notification and the safe route mapper handles navigation.
- Cold start: the initial notification is processed through the same safe route mapper.
- Background message handler is registered before Expo Router starts.

The notifications provider is mounted alongside, not inside, the radio provider. Push handling must not stop or recreate radio playback.

## Native build requirements

This feature adds `@react-native-firebase/messaging`. Expo Go cannot test this integration; a new Development Build is required.

Android development build:

```bash
npx eas-cli@latest build --platform android --profile development
```

Install the APK produced by Expo, then run Metro normally:

```bash
npx expo start --dev-client -c
```

Android 13+ requires the runtime `POST_NOTIFICATIONS` permission.

For iOS, the project declares the development APNs entitlement and remote-notification background mode. Apple push credentials/APNs delivery still require physical iOS QA before release.

## Physical QA checklist

### Account and onboarding

- create a new email/password account;
- confirm `/auth/session` succeeds;
- choose content interests and confirm they persist in `/me`;
- skip push once and confirm the device can exist with notifications disabled;
- reopen the app and confirm the Firebase session persists.

### Push registration

- activate push from onboarding or Settings;
- accept the Android/iOS permission prompt;
- confirm the existing installation receives an FCM token server-side without logging it in Mobile;
- force/reproduce a token refresh when practical and confirm the same device record is updated;
- deny/revoke permission and confirm backend notifications are disabled.

### Preferences and inbox

- toggle each server-backed category;
- confirm `general` behaves as its own category, not a master switch;
- send a real notification from the backend;
- confirm foreground banner and inbox behavior;
- mark one notification read;
- mark all notifications read;
- verify pagination with more than one page.

### Navigation

Test all allowlisted targets:

- `/home`
- `/radio`
- `/dynamics`
- `/dynamics/{uuid}`

Test a malformed/unknown target and confirm it cannot execute arbitrary navigation. Test a dynamic that has been removed and confirm the existing safe 404 state is shown.

### Lifecycle and regression

- tap a notification from background;
- tap a notification from a terminated/cold app;
- confirm duplicate handling by `notificationId` does not navigate twice;
- start radio playback, exercise foreground/background notification handling and confirm playback is not interrupted;
- logout and confirm the device is unlinked before Firebase Auth closes;
- login again and confirm the installation is registered safely for the current account.
