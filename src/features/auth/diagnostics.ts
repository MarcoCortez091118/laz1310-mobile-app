/**
 * Structured, privacy-safe auth failure information for production triage.
 *
 * Never copy native error messages, credentials, tokens or user identifiers
 * into user-facing diagnostics. The only retained fields are coarse stage,
 * SDK error code, HTTP status and the API-generated request ID.
 */
export type AuthFailureStage =
  | 'google-services'
  | 'google-account'
  | 'google-credentials'
  | 'firebase-credential'
  | 'app-check'
  | 'api-session'
  | 'api-profile';

export interface AuthFailureInfo {
  stage: AuthFailureStage;
  code: string | null;
  httpStatus: number | null;
  requestId: string | null;
}

function field(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function safeCode(value: unknown): string | null {
  const text = typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';
  // Provider error codes are machine-readable; never reflect a raw message.
  return text.length > 0 && text.length <= 80 && /^[a-zA-Z0-9_./:-]+$/.test(text)
    ? text
    : null;
}

function safeHttpStatus(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) &&
    value >= 400 && value <= 599
    ? value
    : null;
}

function safeRequestId(value: unknown): string | null {
  return typeof value === 'string' &&
    /^[a-fA-F0-9-]{16,64}$/.test(value)
    ? value
    : null;
}

export class AuthStageError extends Error {
  readonly stage: AuthFailureStage;
  readonly code: string | null;
  readonly httpStatus: number | null;
  readonly requestId: string | null;

  constructor(stage: AuthFailureStage, original: unknown) {
    super('Authentication failed at ' + stage);
    this.name = 'AuthStageError';
    const source = field(original);
    this.stage = stage;
    this.code = safeCode(source.code);
    this.httpStatus = safeHttpStatus(source.status);
    this.requestId = safeRequestId(source.requestId);
  }
}

export function atAuthStage(
  stage: AuthFailureStage,
  error: unknown,
): AuthStageError {
  return error instanceof AuthStageError ? error : new AuthStageError(stage, error);
}

export function authFailureInfo(error: unknown): AuthFailureInfo | null {
  if (!(error instanceof AuthStageError)) return null;
  return {
    stage: error.stage,
    code: error.code,
    httpStatus: error.httpStatus,
    requestId: error.requestId,
  };
}
