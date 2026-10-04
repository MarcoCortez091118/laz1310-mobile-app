# Firebase Auth + App Check — Mobile V1

LA Z Mobile uses native Firebase SDKs through React Native Firebase.

## Identity flow

```text
email + password OR Google account
              ↓
Firebase Authentication
              ↓
Firebase ID token
      +
Firebase App Check token
              ↓
POST /api/v1/auth/session
              ↓
LA Z business profile
              ↓
GET/PATCH /api/v1/me
```

FastAPI never receives or stores the user's password or Google credential.

## Packages

- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/app-check`
- `@react-native-google-signin/google-signin`

This is native functionality and is not available in Expo Go. A new Development
Build is required after introducing or changing these native modules.

## Firebase native app registration

The Firebase project must contain apps matching:

```text
Android: com.neuromarket.laz1310
iOS:     com.neuromarket.laz1310
```

Download the platform configuration files directly from Firebase Console:

- Android: `google-services.json`
- iOS: `GoogleService-Info.plist`

Do not commit either file.

The Expo config reads file paths from:

```text
GOOGLE_SERVICES_JSON
GOOGLE_SERVICE_INFO_PLIST
```

For EAS, configure these as file environment variables/secrets.

## Google Sign-In

Firebase Authentication must have the Google provider enabled.

For Android:

1. Use package name `com.neuromarket.laz1310`.
2. Obtain the SHA-1 fingerprint for the EAS Android keystore.
3. Register that SHA-1 on the Android app in Firebase Project Settings.
4. Download a fresh `google-services.json` after the fingerprint/provider setup.
5. Ensure the Google Cloud project has an OAuth client ID of type **Web**.
6. Configure that public client ID for the build as:

```text
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web-client-id>.apps.googleusercontent.com
```

The mobile app uses the Google ID token only to create a Firebase
`GoogleAuthProvider` credential. After Firebase signs the user in, the normal LA Z
`POST /api/v1/auth/session` synchronization runs; the backend does not need a
Google-specific authentication endpoint.

The account entry screen presents, in order:

```text
Crear cuenta
Ingresar con Google
Ya tengo cuenta
```

Cancelling the native Google account chooser leaves the user on the same screen
without creating a session or showing an authentication error.

## App Check

Development native builds use the Firebase App Check **debug provider**.
Production builds use real attestation providers:

```text
Android → Play Integrity
Apple   → App Attest with DeviceCheck fallback
```

For an interactive Android Development Build, the debug provider creates a
device-local debug secret. Obtain it from Android logs and register it in Firebase
Console under **App Check → Android app → Manage debug tokens**. Example:

```bash
adb logcat -c
adb logcat | grep -i "DebugAppCheckProvider\|AppCheck"
```

Open LA Z and trigger an authenticated action. Android should log a message asking
you to add the debug secret to the Firebase Console allow list. Register that token
directly in Firebase; do not paste it into source code or commit it.

A variable named `FIREBASE_APP_CHECK_DEBUG_TOKEN` is not consumed automatically by
the current mobile runtime. Do not assume that merely creating that EAS variable
registers the device. For interactive physical-device QA, the Firebase Console
debug-token allow list is the source of truth.

## Backend headers

Protected requests are sent with:

```http
Authorization: Bearer <Firebase ID token>
X-Firebase-AppCheck: <App Check token>
```

The LA Z FastAPI backend validates both independently. This means Firebase can
successfully create/sign in a user while `/api/v1/auth/session` still fails if App
Check is invalid or unavailable.

The mobile UI therefore distinguishes Firebase authentication success from LA Z
session synchronization failures instead of falsely reporting that the Firebase
account was not created.

## Current V1 behavior

Implemented:

- email/password account creation
- email/password sign-in
- Google sign-in through Firebase Authentication
- native persistent Firebase session
- `POST /auth/session` synchronization
- real `GET/PATCH /me` profile
- display-name editing
- email verification request + refresh
- sign-out
- App Check token acquisition
- Dynamics participation security headers
- explicit diagnostics when Firebase succeeds but App Check/API synchronization fails

Deferred:

- Apple sign-in
- password reset UI
- account deletion
- favorites / saved items

Notifications, device registration, category preferences and interests are
implemented by the Notifications V1 workstream layered on top of this auth
boundary.

## Physical QA

1. Install a Development Build containing the current native modules.
2. Register the device's App Check debug token in Firebase Console.
3. Confirm `Crear cuenta`, `Ingresar con Google`, and `Ya tengo cuenta` appear.
4. Create a new email/password account and confirm Firebase + LA Z profile sync.
5. Sign out.
6. Sign back in with the same email/password account and confirm the LA Z profile loads.
7. Choose `Ingresar con Google`, select a Google account, and confirm Firebase
   Console shows provider `google.com` for the user.
8. Confirm Profile shows the LA Z API business profile and Google display name.
9. Kill/reopen the app and verify the Firebase session is restored.
10. Regression-test notification device registration and radio background playback.
