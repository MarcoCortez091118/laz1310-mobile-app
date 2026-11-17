# LA Z 1310 Mobile — Account deletion request

Related Issues: Mobile #85, API #119, Website #44.

## UI and contract

- Perfil → Configuración → Cuenta → **Solicitar eliminación de cuenta**.
- A destructive confirmation dialog explicitly explains that submission **does not immediately delete** the account or its data.
- Authenticated request uses current Firebase ID token and App Check token to call POST `/api/v1/me/deletion-requests`, body `{"confirm":true}`.
- HTTP 202 returns id, status and requestedAt. Status may be pending_verification or pending_review; UI does not pretend deletion has already happened.
- User can visit `https://laz1310.com/eliminar-cuenta/` for a public alternative without being signed in.
- Existing Firebase Auth session, radio and other app features remain intact until a separately verified deletion process is completed.

## Deployment sequence

1. API feature must be released and protected first.
2. Website page must be publicly reachable and the LA Z 1310 support mailbox staffed.
3. QA physical Android sign-in (email + Google), App Check, POST with correct ID token, repeated request idempotence, unverified email branch and invalid/offline request error.
4. Ship a new Android release AAB, incremented version code. Do not rely on Expo web preview for App Check.
5. Legal/product owner must confirm data-retention exceptions and execute approved deletion requests, not merely accept them.
6. Manual review + CI gates + merge; no automerge.

## Rollback

Revert UI and release prior app version if API support is withdrawn. Previously submitted requests remain recorded server-side for handling.
