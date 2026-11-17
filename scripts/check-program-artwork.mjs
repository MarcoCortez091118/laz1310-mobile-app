import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

const home = read('app/home.tsx');
const card = read('src/components/ProgramCard.tsx');
const feed = read('src/components/ProgramFeedCard.tsx');
const detail = read('app/programs/[id].tsx');

// All published posters must be completely visible in a square viewport.
assert.match(card, /aspectRatio:\s*1/);
assert.match(card, /resizeMode="contain"/);
assert.doesNotMatch(card, /height:\s*132/);
assert.match(feed, /aspectRatio:\s*1/);
assert.match(feed, /resizeMode="contain"/);
assert.match(detail, /aspectRatio:\s*1/);
assert.match(detail, /resizeMode="contain"/);

// The editorial artwork label is removed from Home ONLY.
assert.match(card, /showArtworkLabel\?: boolean/);
assert.match(card, /showArtworkLabel = true/);
assert.match(card, /showArtworkLabel \? \(/);
assert.equal(
  (home.match(/showArtworkLabel=\{false\}/g) ?? []).length,
  2,
  'both Home rendering branches must hide the image label',
);

// Single-program cards do not stretch edge to edge; pairs stay two-column;
// larger catalogs retain a scrollable horizontal layout.
assert.match(home, /programs\.length > 2 \? \(/);
assert.match(home, /horizontal/);
assert.match(home, /programs\.length === 1 \? styles\.programSingleCard : styles\.programPairCard/);
assert.match(home, /programSingleCard:\s*\{[^}]*maxWidth:\s*380/s);
assert.match(home, /programPairCard:\s*\{[^}]*flex:\s*1/s);

console.log('LA Z Home / Programs square artwork layout invariants OK.');
