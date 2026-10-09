import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const saved = {
  EAS_BUILD: process.env.EAS_BUILD,
  EAS_BUILD_PLATFORM: process.env.EAS_BUILD_PLATFORM,
  EAS_BUILD_PROFILE: process.env.EAS_BUILD_PROFILE,
  GOOGLE_SERVICES_JSON: process.env.GOOGLE_SERVICES_JSON,
};

function withEnv(values, fn) {
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  try {
    delete require.cache[require.resolve('../app.config.js')];
    return fn(require('../app.config.js'));
  } finally {
    delete require.cache[require.resolve('../app.config.js')];
  }
}

try {
  assert.throws(
    () => withEnv({
      EAS_BUILD: 'true',
      EAS_BUILD_PLATFORM: 'android',
      EAS_BUILD_PROFILE: 'preview',
      GOOGLE_SERVICES_JSON: undefined,
    }, (app) => app({ config: {} })),
    /GOOGLE_SERVICES_JSON/,
    'Android EAS builds without the Firebase file must fail explicitly',
  );

  const filePath = '/tmp/android-firebase-fixture.json';
  const android = withEnv({
    EAS_BUILD: 'true',
    EAS_BUILD_PLATFORM: 'android',
    EAS_BUILD_PROFILE: 'preview',
    GOOGLE_SERVICES_JSON: filePath,
  }, (app) => app({ config: {} }));
  assert.equal(android.android.googleServicesFile, filePath);
  assert.equal(android.android.package, 'com.neuromarket.laz1310');

  const ios = withEnv({
    EAS_BUILD: 'true',
    EAS_BUILD_PLATFORM: 'ios',
    GOOGLE_SERVICES_JSON: undefined,
  }, (app) => app({ config: {} }));
  assert.ok(ios.ios, 'iOS config should not depend on the Android Firebase file');

  const local = withEnv({
    EAS_BUILD: undefined,
    EAS_BUILD_PLATFORM: undefined,
    GOOGLE_SERVICES_JSON: undefined,
  }, (app) => app({ config: {} }));
  assert.equal(local.android.googleServicesFile, undefined);

  console.log('EAS Firebase Android Preview config checks passed');
} finally {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
