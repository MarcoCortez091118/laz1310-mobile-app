import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('Home and Explore display Premios / Prizes and preserve existing routes', () => {
  for (const path of ['app/home.tsx', 'app/explore.tsx']) {
    const source = read(path);
    assert.match(source, /english \? 'Prizes' : 'Premios'/, path);
    assert.match(source, /route: '\/dynamics'/, path);
  }
});

test('prizes list, details and history show consistent bilingual labels', () => {
  const index = read('app/dynamics/index.tsx');
  const detail = read('app/dynamics/[id].tsx');
  const confirmation = read('app/dynamics/confirmation.tsx');
  const history = read('app/dynamics/participations.tsx');
  assert.match(index, /title=\{english \? 'Prizes' : 'Premios'\}/);
  assert.match(index, /No hay premios activos/);
  assert.match(index, /No active prizes/);
  assert.match(index, /'Open prize' : 'Abrir premio'/);
  assert.match(detail, /title=\{english \? 'Prize' : 'Premio'\}/);
  assert.match(detail, /View all prizes/);
  assert.match(confirmation, /Back to Prizes/);
  assert.match(confirmation, /Volver a Premios/);
  assert.match(history, /Tu historial de premios/);
  assert.match(history, /View Prizes/);
  assert.match(history, /Ver Premios/);
});

test('accessibility, participation and settings copy align with Premios', () => {
  const hero = read('src/components/PromoHero.tsx');
  const profile = read('app/profile/index.tsx');
  const settings = read('app/profile/settings/index.tsx');
  const participate = read('app/dynamics/[id]/participate.tsx');
  assert.match(hero, /'Open prize' : 'Abrir premio'/);
  assert.match(profile, /Participaciones en premios con tu cuenta LA Z/);
  assert.match(settings, /programs and prizes/);
  assert.match(settings, /programas y premios/);
  assert.match(participate, /Este premio no acepta participaciones/);
  assert.match(participate, /This prize is not accepting entries/);
});

test('the user-visible rename does not modify internal API and navigation identifiers', () => {
  const api = read('src/features/dynamics/api.ts');
  const home = read('app/home.tsx');
  const list = read('app/dynamics/index.tsx');
  const participate = read('app/dynamics/[id]/participate.tsx');
  assert.match(api, /\/api\/v1\/dynamics/);
  assert.match(home, /id: 'dynamics'/);
  assert.match(list, /getDynamics/);
  assert.match(list, /\/dynamics\/participations/);
  assert.match(participate, /submitParticipation/);
  assert.match(participate, /\/dynamics\/confirmation/);
});

test('old Dynamics/Dinámicas labels are not displayed in changed screens', () => {
  const pages = [
    'app/home.tsx', 'app/explore.tsx', 'app/dynamics/index.tsx',
    'app/dynamics/[id].tsx', 'app/dynamics/[id]/participate.tsx',
    'app/dynamics/confirmation.tsx', 'app/dynamics/participations.tsx',
    'app/profile/index.tsx', 'app/profile/settings/index.tsx',
    'src/components/PromoHero.tsx',
  ];
  for (const page of pages) {
    const source = read(page);
    const literalStrings = Array.from(source.matchAll(/(['"])(.*?)\1/g), ([, , value]) => value);
    const stale = literalStrings.filter(value =>
      !value.startsWith('/') &&
      !value.startsWith('../') &&
      !value.startsWith('dynamics') &&
      !value.includes('features/dynamics/') &&
      !value.includes('dynamicId') &&
      /(?:\bDynamics\b|\bDynamic\b|din[aá]mic[ao]s?)/i.test(value)
    );
    assert.deepEqual(stale, [], page + ' has stale UX text');
  }
});
