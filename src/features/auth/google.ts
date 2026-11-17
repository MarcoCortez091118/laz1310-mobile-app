import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  type User,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';

import { selectGoogleCredentialTokens } from './google-credential';
import { firebaseAuth } from './firebase';
import { atAuthStage } from './diagnostics';

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
  try {
    // A malformed supplied value must not silently switch to the fallback.
    if (webClientId && !webClientId.endsWith('.apps.googleusercontent.com')) {
      throw googleAuthError(
        'auth/google-config-invalid',
        'The configured Google OAuth Web Client ID is invalid.',
      );
    }
    GoogleSignin.configure(
      webClientId?.endsWith('.apps.googleusercontent.com')
        ? { webClientId }
        : {},
    );
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch (error) {
    throw atAuthStage('google-services', error);
  }

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (error) {
    throw atAuthStage('google-account', error);
  }
  if (!isSuccessResponse(response)) return null;

  let googleCredential;
  try {
    const idToken = response.data.idToken;
    // Without a configured Web OAuth Client ID the native provider can
    // return an access token rather than an ID token.
    const accessToken = idToken?.trim()
      ? null
      : (await GoogleSignin.getTokens()).accessToken;
    const tokens = selectGoogleCredentialTokens({ idToken, accessToken });
    googleCredential = GoogleAuthProvider.credential(
      tokens.idToken,
      tokens.accessToken,
    );
  } catch (error) {
    throw atAuthStage('google-credentials', error);
  }

  try {
    const result = await signInWithCredential(firebaseAuth(), googleCredential);
    return result.user;
  } catch (error) {
    throw atAuthStage('firebase-credential', error);
  }
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
