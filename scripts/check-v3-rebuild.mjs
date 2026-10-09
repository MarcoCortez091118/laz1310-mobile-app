import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(path, 'utf8');

const shell = read('src/components/v3/V3Layout.tsx');
const landing = read('app/index.tsx');
const radio = read('app/radio.tsx');
const prizes = read('app/prizes.tsx');
const advert = read('app/advertise.tsx');
const contact = read('app/contact.tsx');
const policy = read('app/privacy.tsx');
const config = read('app.config.js');

for (const route of ['/radio', '/prizes', '/advertise', '/privacy']) {
  assert.ok(shell.includes(route), `Missing V3 route: ${route}`);
}
for (const text of ['Compartir', 'Premios', 'Anúnciate', 'Privacidad']) {
  assert.ok(shell.includes(text), `Missing PDF V3 tab: ${text}`);
}
assert.match(landing, /router\.replace\('\/radio'\)/);
assert.match(radio, /useRadio/);
assert.match(radio, /VinylArtwork/);
assert.match(shell, /shareLiveRadio/);
assert.match(prizes, /getDynamics/);
assert.match(prizes, /\/dynamics\/\$\{id\}\/participate/);
assert.match(advert, /v3-coverage-maps.webp/);
assert.match(contact, /ADVERTISING_EMAIL/);
assert.match(contact, /Linking\.openURL/);
assert.match(policy, /NEUROMARKET_PRIVACY_POLICY_ES/);
assert.doesNotMatch(policy, /Radio\s*Online\s*HD/);
assert.match(config, /com\.neuromarket\.laz1310/);

console.log('LA Z V3 PDF navigation and integration checks passed.');
