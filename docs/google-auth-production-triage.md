# LA Z 1310 — Production Google Sign-In triage (2026-11-17)

## Symptom
Android shows `We could not complete authentication`. FastAPI logs show
normal content GETs but no `POST /api/v1/auth/session` in the supplied
time window. An API 200 response is **not** proof that Firebase Authentication
or Play Integrity is working.

## Find the failing stage
The app now shows a privacy-safe diagnostic reference and logs
`LAZ_AUTH_GOOGLE_FAILURE` when the Google button fails. Session restore may
log `LAZ_AUTH_RESTORE_FAILURE`. A log consists only of:

- `stage`: `google-services`, `google-account`, `google-credentials`,
  `firebase-credential`, `app-check`, `api-session` or `api-profile`
- `code`: sanitized SDK provider code, if present
- `httpStatus`: 400-599, only for API errors
- `requestId`: API correlation ID, if present

Never log Google/Firebase/Play Integrity tokens, Google user data, OAuth
authorization codes, Firebase credentials, email addresses or raw exceptions.

### Interpret the reference

| Stage | Where it fails | What to verify |
| --- | --- | --- |
| `google-services`, `google-account` | Native Google SDK before Firebase | Package `com.neuromarket.laz1310`, Android signing SHA-1/SHA-256, OAuth client IDs, Play Services |
| `google-credentials` | Obtaining Google ID/access token | Android OAuth configuration, optional Web OAuth client ID |
| `firebase-credential` | Google credential exchange in Firebase Authentication | Firebase project, Google sign-in method, provider and consent settings |
| `app-check` | Acquiring Firebase App Check token before calling FastAPI | Play Integrity and **actual distribution channel** |
| `api-session`, `api-profile` | FastAPI session / profile | HTTP status, `X-Request-ID`, API project/identity and app-check requirements |

`DEVELOPER_ERROR` or `10` typically indicates native OAuth configuration
mismatch rather than an API failure. Run the provider's configuration doctor
with the **exact APK** that fails:

```bash
npx @react-native-google-signin/config-doctor
```

## Verify Google and Firebase configuration

1. Firebase Console **Authentication → Sign-in method → Google**: enabled.
2. Firebase Console **Project Settings → Android app**: package is
   `com.neuromarket.laz1310`; add **SHA-1** and **SHA-256** for the *actual*
   signing key. Preview APK signed by EAS and Play-distributed production AAB
   have different signing identities. Google Play Internal App Sharing can
   use yet another signing certificate.
3. Google Cloud Credentials: Android OAuth client is for the exact package +
   SHA-1; if `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set, it must be the
   **Web application OAuth Client ID** of the same Firebase project, *not*
   the Android client ID or a client secret.
4. Download `google-services.json` from the same Firebase Android app **after
   updating the SHA/Google provider settings**. Verify it contains the expected
   package and OAuth client entries. Configure `GOOGLE_SERVICES_JSON` as EAS
   File environment variable in **the relevant environment**
   (`development`/`preview`/`production`). Build again after replacing it.
   Azure settings are separate and do not configure the native APK.
5. For App Check: register Android app with **Play Integrity** in Firebase;
   verify the Google Play app-signing SHA-256 and API/project linking. Production
   apps automatically request an App Check token; users never enter debug
   tokens. `__DEV__` is false in Preview APKs too, so they use Play Integrity
   rather than the debug provider. Play Integrity commonly requires
   `PLAY_RECOGNIZED`, which sideloaded previews generally cannot satisfy.
   Validate production flow with an app installed from **Google Play Internal
   Testing**, not by sideloading APKs or relying on Appetize.
6. Verify the right version is **installed**, not merely merged. Rebuilding
   native configuration requires an EAS build; Metro reload does not update
   `google-services.json` embedded in an already-installed app.

## No security bypass
Do not disable App Check enforcement, share debug tokens with customers,
fallback to nonverified Firebase sessions, or bypass FastAPI ID-token
verification. FastAPI is the authority for user profiles.

## End-to-end validation
- Android new Google account: native Google → Firebase Auth user →
  App Check → POST /api/v1/auth/session (200) → profile
- Android existing Google user: same UID/account; reopen restores session
- Cancel Google picker: no error or session creation
- Wrong signing certificate: recoverable and diagnostic, not generic message
- App Check rejection: show `app-check`, no request sent to FastAPI
- API 401/503: show `api-session`, safe HTTP status and request ID
- Verify user emails and tokens do not appear in diagnostic logs
