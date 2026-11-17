# Google Sign-In fails in Android Play testing (Issue #87)

## Symptom and code finding
A tester tapping **Continuar con Google** sees **«Correo o contraseña incorrectos»**.
This does not establish that a Google account/password is invalid. Before this fix,
`auth/invalid-credential` was always translated as an email/password error even
when `GoogleAuthProvider.credential()` was rejected by Firebase.

This PR gives the Google→Firebase exchange its own diagnostic stage,
`google-firebase-credential`, and keeps email/password errors unchanged.
It corrects the message, **not** the remote OAuth/Firebase configuration.
Never log tokens, passwords, access/ID tokens, email addresses or the full
native provider error text.

## Diagnose the build that actually failed

1. Identify the **distribution path**: Play Console internal/closed testing
   installed from Google Play, or sideloaded EAS Preview APK. The
   signing certificate can be different between these paths.
2. Check **Firebase Console → Authentication → Sign-in method → Google**:
   enabled in the *same Firebase project* this build uses.
3. Check **Firebase Console → Project settings → Your apps → Android**:
   package must be `com.neuromarket.laz1310`. Add the exact **SHA-1**
   fingerprint for the signing certificate used by the installed build.
   Add **SHA-256** as well for Play Integrity/App Check.
4. For an app **installed through Google Play**, obtain the **App signing key
   certificate** SHA-1/SHA-256 in **Play Console → App integrity / Play App
   Signing**. Do not confuse it with the **upload key certificate**.
   For a **sideloaded EAS APK**, obtain the relevant signing fingerprint with
   `eas credentials -p android`. Keep both certificates registered where
   both distribution paths are used.
5. In the Firebase-linked **Google Cloud OAuth credentials**, verify that
   the Android client matches the package and SHA-1. If
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set, it must be the **Web**
   OAuth client ID from the **same Firebase project** and end in
   `.apps.googleusercontent.com`. It is optional for this native
   implementation's Google access-token fallback; do not add a secret
   to `EXPO_PUBLIC_*` settings.
6. After changing Android SHA/OAuth configuration, download the **updated
   `google-services.json`** from Firebase and confirm the EAS secret
   **`GOOGLE_SERVICES_JSON`** (type FILE) points to the updated artifact
   in the **preview** and/or **production** environment as appropriate.
   If native Firebase/OAuth configuration changes, rebuild the affected
   Android binary. Never commit the secrets to the repository.
7. For Firebase App Check enforcement, verify that Play Integrity is
   configured for this Firebase Android app and test using its intended
   distribution. `firebase.ts` uses Play Integrity when `__DEV__` is false;
   preview APKs can therefore behave differently from development builds.
8. Re-test the **same distributed build** through the intended channel.
   If the issue persists, capture only the sanitized `LAZ_AUTH_GOOGLE_FAILURE`
   fields (`stage`, `code`, optional `httpStatus`/`requestId`) and check:
   - `google-account`: native OAuth account selection, signing/OAuth client
   - `google-credentials`: no usable Google token
   - `google-firebase-credential`: Google credential rejected during Firebase sign-in
   - `app-check`: attestation/token failure
   - `api-session` or `api-profile`: Firebase sign-in succeeded, but LA Z
     FastAPI profile synchronization failed

## Release acceptance
- Login and new-account creation with a fresh Google user on a real Android
  device installed through Google Play testing; same Firebase UID on re-login
- Existing Google user re-login, cancellation, and existing email/password
- Existing email associated with a different provider produces the explicit
  provider-collision error, not a duplicate LA Z account
- Firebase Auth, Firebase App Check, FastAPI `POST /api/v1/auth/session` and
  `GET/PATCH /api/v1/me` behave as intended
- CI: `npm run typecheck`, `npm run check:google-auth`,
  `npm run check:auth-diagnostics`; no merge until real-device QA

References:
- https://firebase.google.com/docs/auth/android/google-signin
- https://docs.expo.dev/guides/google-authentication/
- https://react-native-google-signin.github.io/docs/setting-up/get-config-file
- https://developers.google.com/android/guides/client-auth
