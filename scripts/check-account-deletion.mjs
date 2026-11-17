import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const account = readFileSync('app/profile/settings/account.tsx', 'utf8');
const api = readFileSync('src/features/auth/api.ts', 'utf8');

assert.match(account, /confirmAccountDeletionRequest/);
assert.match(account, /Solicitar eliminación de cuenta/);
assert.match(account, /Alert\.alert\(/);
assert.match(account, /getFirebaseSecurityTokens\(true\)/);
assert.match(account, /requestBusinessAccountDeletion\(tokens\)/);
assert.match(api, /pending_review/);
assert.match(account, /pending_verification/);
assert.match(account, /https:\/\/laz1310\.com\/eliminar-cuenta\//);
assert.doesNotMatch(account, /deleteUser\(/);
assert.doesNotMatch(account, /firestore\(\).*delete/);
assert.match(api, /\/api\/v1\/me\/deletion-requests/);
assert.match(api, /method: 'POST'/);
assert.match(api, /headers: authHeaders\(tokens\)/);
assert.match(api, /JSON\.stringify\(\{ confirm: true \}\)/);
console.log('LA Z account deletion request flow checks OK.');
