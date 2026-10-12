/**
 * Firebase accepts a Google ID token or a Google OAuth access token.
 * The legacy native Google SDK only returns an ID token when an OAuth Web
 * Client ID is configured. The access-token path allows Android clients
 * already configured via Firebase to sign in without a Metro-only variable.
 *
 * Only the selected token is passed to Firebase Authentication locally.
 * The API still receives a separate Firebase ID token + App Check.
 */
export type GoogleCredentialTokens = {
  idToken?: string | null;
  accessToken?: string | null;
};

export type SelectedGoogleCredential =
  | { kind: 'idToken'; idToken: string; accessToken: null }
  | { kind: 'accessToken'; idToken: null; accessToken: string };

export function selectGoogleCredentialTokens({
  idToken,
  accessToken,
}: GoogleCredentialTokens): SelectedGoogleCredential {
  const usableIdToken = idToken?.trim();
  if (usableIdToken) {
    return { kind: 'idToken', idToken: usableIdToken, accessToken: null };
  }

  const usableAccessToken = accessToken?.trim();
  if (usableAccessToken) {
    return { kind: 'accessToken', idToken: null, accessToken: usableAccessToken };
  }

  throw Object.assign(
    new Error('Google did not provide a usable credential for Firebase.'),
    { code: 'auth/google-token-unavailable' },
  );
}
