import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const path = 'assets/brand/brush-red-corners.png';
const asset = readFileSync(path);
const background = readFileSync('src/components/AppBackground.tsx', 'utf8');

test('the approved red brush is bundled as optimized transparent PNG', () => {
  assert.equal(asset.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(asset.readUInt32BE(16), 512);
  assert.equal(asset.readUInt32BE(20), 443);
  assert.equal(asset[25], 6, 'RGBA image with alpha channel');
  assert.equal(
    createHash('sha256').update(asset).digest('hex'),
    'fbacae1fff04ef60ea1d7b809a9499bb14fd2ed01228c8048a01e240df05adb2',
  );
});

test('both background corners use the same official asset below screen content', () => {
  assert.equal(
    background.split("require('../../assets/brand/brush-red-corners.png')").length - 1,
    2,
  );
  assert.match(background, /top:\s*-brushHeight\s*\*\s*0\.37/);
  assert.match(background, /left:\s*-brushWidth\s*\*\s*0\.47/);
  assert.match(background, /bottom:\s*-brushHeight\s*\*\s*0\.35/);
  assert.match(background, /right:\s*-brushWidth\s*\*\s*0\.46/);
  assert.match(background, /style=\{StyleSheet\.absoluteFill\}/);
  assert.match(background, /pointerEvents="none"/);
  assert.match(background, /importantForAccessibility="no-hide-descendants"/);
  assert.ok(background.lastIndexOf('{children}') > background.lastIndexOf('brush-red-corners.png'));
});

test('the brushes stay subtle, theme-aware and respect the background setting', () => {
  assert.match(background, /preference === 'dark' \? 0\.16 : 0\.12/);
  assert.match(background, /Math\.min\(238, Math\.max\(170, windowWidth \* 0\.54\)\)/);
  assert.match(background, /if \(!enabled \|\| !remoteEnabled\)/);
  assert.match(background, /backgroundImageUrl/);
  assert.match(background, /remoteFailed/);
  assert.doesNotMatch(background, /VinylArtwork/);
});
