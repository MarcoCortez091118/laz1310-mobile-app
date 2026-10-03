import { apiRequest } from '../../api/client';
import { FirebaseSecurityTokens } from './firebase';

export type UserInterest =
  | 'radio'
  | 'news'
  | 'events'
  | 'shows'
  | 'community';

export interface LazUserProfile {
  id: string;
  firebaseUid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  locale: string | null;
  timezone: string | null;
  profileCompleted: boolean;
  interests: UserInterest[];
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
}

export interface UpdateLazProfile {
  displayName?: string;
  locale?: string;
  timezone?: string;
  interests?: UserInterest[];
}

export function firebaseAuthHeaders(tokens: FirebaseSecurityTokens) {
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
    headers: firebaseAuthHeaders(tokens),
  });
}

export function getBusinessProfile(tokens: FirebaseSecurityTokens) {
  return apiRequest<LazUserProfile>('/api/v1/me', {
    headers: firebaseAuthHeaders(tokens),
  });
}

export function patchBusinessProfile(
  tokens: FirebaseSecurityTokens,
  payload: UpdateLazProfile,
) {
  return apiRequest<LazUserProfile>('/api/v1/me', {
    method: 'PATCH',
    headers: firebaseAuthHeaders(tokens),
    body: JSON.stringify(payload),
  });
}
