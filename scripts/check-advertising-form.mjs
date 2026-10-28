import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = path => readFileSync(path, 'utf8');
const form = source('app/advertise.tsx');
const model = source('src/features/advertising/model.ts');
const transport = source('src/features/advertising/api.ts');

for (const field of ['firstName', 'lastName', 'company', 'phone', 'email', 'message']) {
  assert.ok(form.includes("labels." + field), 'Missing advertising input: ' + field);
  assert.ok(model.includes(field + ':'), 'Missing validation model: ' + field);
}
assert.match(form, /CONTINUAR/);
assert.match(form, /Términos y condiciones/);
assert.match(form, /Aviso de privacidad/);
assert.match(form, /submitAdvertisingLead\(form, requestId\)/);
assert.match(form, /sending \|\| received/);
assert.match(model, /if \(!accepted\) return 'consent'/);
assert.match(transport, /getFirebaseSecurityTokens\(false\)/);
assert.match(transport, /'X-Firebase-AppCheck'/);
assert.match(transport, /Idempotency-Key/);
assert.match(transport, /\/api\/v1\/advertising\/leads/);
assert.match(transport, /termsAccepted: true/);
assert.match(transport, /privacyAccepted: true/);
assert.match(transport, /response\.status !== 202/);
assert.doesNotMatch(form + model + transport, /n8n\.srv991322|webhook\/6c5c8094/);
console.info('Advertising form + protected API transport checks passed.');
