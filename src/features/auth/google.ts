import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { getApp } from '@react-native-firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  type User,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';

import { selectGoogleCredentialTokens } from './google-credential';

/**
 * Native Google identity is exchanged for a *Firebase* session. LA Z FastAPI
 * only ever receives a Firebase ID token plus App Check through the same
 * AuthProvider synchronize() path used by email/password.
 *
 * A cancellation returns null; it must not change application auth state.
 */
function googleAuthError(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

export async function signInFirebaseGoogle(): Promise<User | null> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw googleAuthError('auth/google-native-required', 'Google sign-in requires a native Android or iOS build.');
  }

  // The public Web OAuth client ID is optional for native Google Sign-In.
  // When it isn't bundled by Metro, Android can still obtain a Google access
  // token using its already-registered package and signing certificate.
  // Firebase accepts that access token without a Web Client ID in JavaScript.
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  GoogleSignin.configure(
    webClientId?.endsWith('.apps.googleusercontent.com')
      ? { webClientId }
      : {},
  );
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;

  const idToken = response.data.idToken;
  // Original native Google Sign-In returns a null idToken if no Web OAuth
  // client ID was supplied. In that case ask the SDK for its access token;
  // the token stays in memory and is exchanged exclusively with Firebase.
  const accessToken = idToken?.trim()
    ? null
    : (await GoogleSignin.getTokens()).accessToken;
  const tokens = selectGoogleCredentialTokens({ idToken, accessToken });
  const googleCredential = GoogleAuthProvider.credential(
    tokens.idToken,
    tokens.accessToken,
  );
  const result = await signInWithCredential(getAuth(getApp()), googleCredential);
  return result.user;
}

/**
 * Clear Google SDK account selection on logout; Firebase sign-out remains the
 * authoritative session boundary and must not be prevented by SDK cleanup.
 */
export async function clearGoogleAccountSelection(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // If Google session is not active or services are unavailable, Firebase
    // logout is still required and must proceed.
  }
}
