import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const footer = read('src/components/v3/V3Shell.tsx');
const index = read('app/index.tsx');
const radio = read('app/radio.tsx');
const prizes = read('app/prizes.tsx');
const contact = read('app/contact.tsx');
const advertise = read('app/advertise.tsx');
const privacy = read('app/privacy.tsx');

for (const route of ['/radio', '/prizes', '/advertise', '/privacy']) {
  assert.ok(footer.includes(route), `Missing V3 footer route: ${route}`);
}
for (const label of ['Compartir', 'Premios', 'Anúnciate', 'Privacidad']) {
  assert.ok(footer.includes(label), `Missing approved footer label: ${label}`);
}
assert.match(index, /router\.replace\('\/radio'\)/);
assert.match(radio, /VinylArtwork/);
assert.match(radio, /useRadio/);
assert.match(footer, /shareLiveRadio/);
assert.match(prizes, /getDynamics/);
assert.match(prizes, /\/dynamics\/\$\{featured\.id\}\/participate/);
assert.match(prizes, /v3-giveaway-banner.webp/);
assert.match(advertise, /v3-coverage-maps.webp/);
assert.match(contact, /ADVERTISING_EMAIL/);
assert.match(contact, /Linking\.openURL/);
assert.match(contact, /accepted/);
assert.match(privacy, /NEUROMARKET_PRIVACY_POLICY_ES/);
assert.doesNotMatch(privacy, /Radio\s*Online\s*HD/i);

console.log('LA Z V3 PDF route + business-invariant checks passed.');
