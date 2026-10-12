import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const home = read('src/components/PromoHero.tsx');
const detail = read('app/dynamics/[id].tsx');

const card = home.split('function PromoCard(')[1]?.split('export function PromoHero()')[0];
assert.ok(card, 'Home campaign card must exist');
assert.match(card, /campaign\.artworkLabel\?\.trim\(\)/);
assert.match(card, /\{label \? \(/);
assert.match(card, /label\.toUpperCase\(\)/);
assert.match(card, /accessibilityLabel=\{\x60\$\{english/);
assert.match(card, /router\.push\(\{/);
assert.match(card, /pathname: '\/dynamics\/\[id\]'/);
assert.doesNotMatch(card, /styles\.(scrim|bottomShade|copy|title|deadline|cta)/);
assert.doesNotMatch(card, /\{campaign\.title\}<\/Text>/);
assert.doesNotMatch(card, /dynamicDeadline/);
assert.doesNotMatch(card, /\{english \? 'JOIN' : 'PARTICIPAR'\}/);

const heroStart = detail.indexOf('<View style={[styles.hero,');
const heroEnd = detail.indexOf('</View>', heroStart);
assert.ok(heroStart >= 0 && heroEnd > heroStart, 'Detail hero must exist');
const hero = detail.slice(heroStart, heroEnd);
assert.match(hero, /source=\{\{ uri: campaign\.imageUrl \}\}/);
assert.match(hero, /accessibilityLabel=\{campaign\.title\}/);
assert.doesNotMatch(hero, /<Text\b/);
assert.doesNotMatch(hero, /styles\.(heroScrim|artLabel|heroTitle|brand)/);

const belowHero = detail.slice(heroEnd);
for (const field of [
  'campaign.title', 'campaign.endsAt', 'campaign.description',
  'campaign.context', 'campaign.instructions', 'handlePrimaryAction',
]) {
  assert.ok(
    belowHero.includes(field) || (field === 'handlePrimaryAction' && detail.includes('onPress={handlePrimaryAction}')),
    `Preserve field or action below art: ${field}`,
  );
}
assert.ok(detail.includes('onPress={handlePrimaryAction}'), 'Participation must remain actionable');
console.log('Dynamics artwork overlay presentation checks passed.');
