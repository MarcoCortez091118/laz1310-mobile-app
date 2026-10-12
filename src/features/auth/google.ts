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

  // A WEB OAuth client ID is required to request an ID token for Firebase.
  // This is a public OAuth client identifier, never a client secret.
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!webClientId || !webClientId.endsWith('.apps.googleusercontent.com')) {
    throw googleAuthError(
      'auth/google-configuration-required',
      'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ' +
      'to the Google WEB OAuth client ID for the LA Z Firebase project.',
    );
  }

  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;

  const idToken = response.data.idToken;
  if (!idToken) {
    throw googleAuthError(
      'auth/google-id-token-missing',
      'Google did not return an ID token. Verify the OAuth WEB client ID ' +
      'and the Android signing-certificate SHA fingerprints in Firebase.',
    );
  }

  const googleCredential = GoogleAuthProvider.credential(idToken);
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
