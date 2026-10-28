import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const approved = {
  dark: {
    file: 'assets/brand/Disc-Black.png',
    sha256: '11ea8a043e71b7d0c147d619d3765137ca471c62bf1145b7451b792b0ce06024',
  },
  light: {
    file: 'assets/brand/Disc-White.png',
    sha256: 'a3e2149880809eb44c97d62d6f17a165adf7b75028c615b31d25d5b04f192462',
  },
};

test('both original approved vinyl artworks are bundled losslessly at 1080×1080', () => {
  for (const { file, sha256 } of Object.values(approved)) {
    const image = readFileSync(file);
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(image.readUInt32BE(16), 1080, file + ' width');
    assert.equal(image.readUInt32BE(20), 1080, file + ' height');
    assert.equal(createHash('sha256').update(image).digest('hex'), sha256, file);
  }
});

test('VinylArtwork selects the correct asset from the shared theme preference', () => {
  const source = readFileSync('src/components/VinylArtwork.tsx', 'utf8');
  assert.match(source, /useAppTheme\(\)/);
  assert.match(source, /dark:\s*require\('\.\.\/\.\.\/assets\/brand\/Disc-Black\.png'\)/);
  assert.match(source, /light:\s*require\('\.\.\/\.\.\/assets\/brand\/Disc-White\.png'\)/);
  assert.match(source, /source=\{vinylSources\[preference\]\}/);
  assert.match(source, /Animated\.loop\(/);
  assert.match(source, /playing\s*=\s*false/);
  assert.doesNotMatch(source, /vinyl-primary\.png/);
});

test('Radio, Home live card and floating player share the theme-aware vinyl', () => {
  for (const path of [
    'app/radio.tsx',
    'src/components/LiveRadioCard.tsx',
    'src/components/MiniPlayer.tsx',
  ]) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /<VinylArtwork/, path);
  }
});
