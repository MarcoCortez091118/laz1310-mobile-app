# EAS Android Preview: Firebase Prebuild unblock (9 Oct 2026)

Tracked in Issue #60. Failed build:
https://expo.dev/accounts/neuromarket-llc/projects/laz1310-mobile-app/builds/35d9a2f5-6926-4d80-9196-fdc7c38f8d25

## Verified root cause

Expo's native Firebase plugin fails during the Android **Prebuild** stage:

```
[android.dangerous]: withAndroidDangerousBaseMod:
Path to google-services.json is not defined.
Please specify expo.android.googleServicesFile.
```

`app.config.js` deliberately sets `android.googleServicesFile` only when
`GOOGLE_SERVICES_JSON` is available. EAS selects `environment: preview`
from `eas.json`, so the Firebase file must be defined **in the same Expo
project's Preview EAS environment**. Setting a variable in GitHub Actions,
or placing a locally gitignored JSON file on the developer's machine,
does not make it available to an EAS cloud build.

The warning `No environment variables with visibility Plain text and
Sensitive found` does not tell us if secret variables exist. The missing
`android.googleServicesFile` path in Prebuild is the definitive failure.

## Required authorized Expo action (not stored in GitHub)

1. In Firebase Console, open the project used by LA Z 1310, then Project
   settings → Your apps → **Android `com.neuromarket.laz1310`**.
   Download that Android app's **google-services.json**.
2. In Expo → `neuromarket-llc` → `laz1310-mobile-app` → Project settings
   → Environment variables, create/update:
   - Name: `GOOGLE_SERVICES_JSON`
   - Environment: **preview**
   - Type: **File** (upload the downloaded JSON file)
   - Visibility: **Secret**
   - Scope: **project**
3. `npx eas-cli@latest env:list --environment preview`: verify the variable
   name and that its type is File; **do not** print/commit the contents.
4. Keep `google-services.json` ignored by Git. Do not replace it with a
   third-party Firebase file or a hardcoded path to a build runner's system.
5. `app.config.js` uses the path provided by EAS at build time; our CI tests
   the path mapping with an artificial pathname only, never real credentials.

Official reference:
https://docs.expo.dev/eas/environment-variables/faq/

## Expo SDK 57 mismatches

The same failed build showed six patch mismatches; bump the manifest minimum
ranges to the expected compatible versions:

| Package | Expected |
| --- | --- |
| expo | ~57.0.27 |
| expo-asset | ~57.0.19 |
| expo-constants | ~57.0.21 |
| expo-linking | ~57.0.12 |
| expo-notifications | ~57.0.22 |
| expo-router | ~57.0.25 |

Install on the developer's existing Mac checkout with `npm install` (the
project does not yet track a package-lock.json), then run
`npx expo install --check`, `npx expo-doctor`,
`npm run check:eas-native-config`, and `npm run typecheck`.
Any package-lock created by npm should be evaluated and committed through the
normal PR process rather than silently discarded.

## Build and validation

After the companion fix PR is merged into
`feat/LAZ-MOBILE-v3-pdf-redesign` and the EAS file variable has been set:

```bash
git fetch origin
git switch feat/LAZ-MOBILE-v3-pdf-redesign
git pull --ff-only origin feat/LAZ-MOBILE-v3-pdf-redesign
npm install
npx expo-doctor
npx eas-cli@latest env:list --environment preview
npx eas-cli@latest build --platform android --profile preview
```

Do not merge V3 into `main` or change the separate
`laz1310-mobile-app-approved` snapshot. This fix does not affect the UI,
bundle ID, app signing, FastAPI, radio stream or Firestore schema.

## Further device gate

A successful APK build is not proof that Play Integrity App Check will
authorize an internally distributed, sideloaded Preview APK. Authenticated
Firebase/API operations require a separate App Check device test (signed app
and registered SHA fingerprints/provider settings). Never relax App Check
validation just to make the preview build succeed.

## Rollback

If the manifest regression affects runtime, revert the fix PR on the V3
feature branch and rerun CI. Keep the EAS file secret managed independently
of code and never expose its contents in logs or pull requests.
