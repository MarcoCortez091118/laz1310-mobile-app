# LA Z 1310 Mobile — Google sign-in and account sign-out confirmation

Issue: #62. Changes are based on the **original main**, not on the V3 design branch.

## Verified main behavior and fix

- **Account Settings → Sign out:** confirmation in Spanish/English with
  Cancel and destructive Sign out. Cancel does not call `signOut()`.
  Confirmation blocks concurrent presses and displays a visible error
  if Firebase or device/session cleanup fails.
- **Tu cuenta LA Z → Ya tengo cuenta:** adds **Continuar con Google** on
  the sign-in email/password steps, and also on the account entry screen.
  Existing email/password registration and sign-in remain in place.
- Google native account chooser produces an ID token **if an optional
  OAuth Web Client ID is available**; without it, the SDK can retrieve a
  Google OAuth access token via `GoogleSignin.getTokens()`. Firebase accepts
  either `GoogleAuthProvider.credential(idToken)` or
  `GoogleAuthProvider.credential(null, accessToken)` before
  `signInWithCredential` logs in to the **existing Firebase Auth project**.
  Then the existing
  `AuthProvider.synchronize(user)` requests the same
  `POST /api/v1/auth/session` using Firebase ID token + Firebase App Check
  and fetches/updates the same LA Z user profile keyed by Firebase UID.
  No Google access token, Google OAuth code or password goes to FastAPI.
  Cancelling the Google sheet is not treated as an error.
- Signing out Google users also clears account selection in the Google
  native SDK, best effort; Firebase logout remains authoritative.
- No automatic user-account merging, linking or bypass of Firebase provider
  collision rules. If the email uses a different Firebase provider, show
  a clear error rather than creating a duplicate profile with guessed UID.

## Required configuration for a real Android APK

1. In the **same Firebase project** currently used by LA Z, enable
   **Authentication → Sign-in method → Google** and configure any required
   OAuth consent/project settings. This cannot be achieved with a UI button
   alone.
2. In **Firebase Project Settings → Your apps → Android**, verify package
   `com.neuromarket.laz1310`. Register SHA-1 and SHA-256 fingerprints
   for the Android signing certificate used by the actual EAS Preview APK
   (and production keys when publishing).
   Download an up-to-date `google-services.json` **if these fingerprints
   caused Google OAuth client settings to change**, and update the EAS
   FILE environment variable `GOOGLE_SERVICES_JSON` for `preview`.
3. The public **Web OAuth Client ID** from this Firebase project
   is **optional** for native sign-in. If already available as
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, Google Sign-In requests an ID token.
   If absent (e.g., when Metro serves JS without the Expo EAS environment),
   the existing native Google SDK can request an access token and exchange
   that token **only with Firebase Authentication**, which issues the same
   Firebase ID token for FastAPI. Do not put an OAuth client secret in Mobile.
   Azure's server-side Firebase settings do not automatically propagate to
   Expo and **must not be repurposed as mobile environment variables**.
4. The Google native module was previously added in PR #63. **No new
   native library or prebuild configuration is introduced by Issue #66**;
   an existing Development Client containing that module can receive this
   patch via Metro (restart with `npx expo start --dev-client -c`).
   Only devices whose APK predates installation of this native library need
   a one-time replacement build. **Expo Go is insufficient.**
5. On iOS, provide the existing `GOOGLE_SERVICE_INFO_PLIST` EAS File
   for the relevant environment, register `com.neuromarket.laz1310`
   and Google URL scheme through the config plugin before building iOS.

Example after the branch is checked out and EAS configured:

```bash
git fetch origin
git switch --track origin/fix/LAZ-MOBILE-google-login-no-client-id
npm install
npx expo start --dev-client -c
```

For a **new native EAS Preview build** (not required for an already-installed
compatible Development Client), the native Firebase file variable
`GOOGLE_SERVICES_JSON` must still be provided in the corresponding EAS
environment. This JS-only sign-in correction neither replaces that file nor
changes existing Azure/Firebase credentials.

## Physical test matrix

- **Account settings:** Cancel → stays signed in; Confirm → logout and
  auth screen; pressing multiple times does not create duplicate requests;
  airplane-mode failures should not display false success.
- **Email/password:** Existing sign-in and new account paths unchanged.
- **Google login:** From Welcome or Ya tengo cuenta → Google picker
  (both with and without the optional Web Client ID) →
  Firebase user persists → LA Z FastAPI business profile synchronized;
  confirm Firebase UID is stable after log out and log in again.
- **OAuth sheet cancel:** no error and no change to Firebase session.
- **Google provider collision:** meaningful error, no automatic account
  creation or silent linking.
- **Backend App Check:** tokens must be generated and validated by existing
  API; sideloaded Preview APK may need separate Play Integrity checks.
- **Language:** Spanish/English screen copy, confirmation labels and errors.
- **Existing account privacy consent:** Google login does not auto-accept a
  privacy notice; users can explicitly review and accept in Profile →
  Privacy & data. Legal approval is separately needed for public distribution.
- **Regression:** radio stream, profile, sign-out, campaigns, FCM lifecycle.

## SDLC

PR to main in Draft for review. CI typecheck/Expo compatibility/audit and
targeted auth regression. Build Android APK, verify Firebase Google provider
and OAuth credentials, then manually merge if approved. **No merge is made
by this implementation.**

Official references:
- https://docs.expo.dev/guides/google-authentication/
- https://react-native-google-signin.github.io/docs/setting-up/expo
- https://react-native-google-signin.github.io/docs/original
- https://reference.rnfirebase.io/_react-native-firebase/auth/GoogleAuthProvider.html
