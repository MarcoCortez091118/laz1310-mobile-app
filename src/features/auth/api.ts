import { apiRequest } from '../../api/client';
import { FirebaseSecurityTokens } from './firebase';

export interface LazUserProfile {
  id: string;
  firebaseUid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  locale: string | null;
  timezone: string | null;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
  privacyPolicyVersion: string | null;
  privacyPolicyAcceptedAt: string | null;
}

export interface UpdateLazProfile {
  displayName?: string;
  locale?: string;
  timezone?: string;
}

function authHeaders(tokens: FirebaseSecurityTokens) {
  if (!tokens.idToken) {
    throw new Error('Firebase ID token is required for this LA Z API request');
  }

  return {
    Authorization: 'Bearer ' + tokens.idToken,
    'X-Firebase-AppCheck': tokens.appCheckToken,
  };
}

export function createBusinessSession(tokens: FirebaseSecurityTokens) {
  return apiRequest<LazUserProfile>('/api/v1/auth/session', {
    method: 'POST',
    headers: authHeaders(tokens),
  });
}

export function getBusinessProfile(tokens: FirebaseSecurityTokens) {
  return apiRequest<LazUserProfile>('/api/v1/me', {
    headers: authHeaders(tokens),
  });
}

export function patchBusinessProfile(
  tokens: FirebaseSecurityTokens,
  payload: UpdateLazProfile,
) {
  return apiRequest<LazUserProfile>('/api/v1/me', {
    method: 'PATCH',
    headers: authHeaders(tokens),
    body: JSON.stringify(payload),
  });
}


export function acceptBusinessPrivacyPolicy(
  tokens: FirebaseSecurityTokens,
  policyVersion: string,
) {
  return apiRequest<LazUserProfile>('/api/v1/me/privacy-consent', {
    method: 'POST',
    headers: authHeaders(tokens),
    body: JSON.stringify({ policyVersion }),
  });
}

export interface AccountDeletionRequest {
  id: string;
  status: 'pending_review' | 'pending_verification';
  requestedAt: string;
}

/**
 * Account deletion is a reviewed request, NOT immediate Firebase Auth deletion.
 * Tokens are attached by the existing protected API client.
 */
export function requestBusinessAccountDeletion(tokens: FirebaseSecurityTokens) {
  return apiRequest<AccountDeletionRequest>('/api/v1/me/deletion-requests', {
    method: 'POST',
    headers: authHeaders(tokens),
    body: JSON.stringify({ confirm: true }),
  });
}
