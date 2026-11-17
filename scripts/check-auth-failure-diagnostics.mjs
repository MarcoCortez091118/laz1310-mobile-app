import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const read = (path) => readFileSync(path, 'utf8');
const js = (source) => ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const dataUrl = (source) =>
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64');

const diagnostics = read('src/features/auth/diagnostics.ts');
const diagnosticsUrl = dataUrl(js(diagnostics));
const { atAuthStage, authFailureInfo } = await import(diagnosticsUrl);
const original = {
  code: '10',
  status: 401,
  requestId: 'abcd1234abcd1234abcd1234abcd1234',
  token: 'PRIVATE_SHOULD_NOT_APPEAR',
  email: 'private@example.invalid',
  message: 'PRIVATE_SHOULD_NOT_APPEAR',
};
const staged = atAuthStage('google-account', original);
const info = authFailureInfo(staged);
assert.deepEqual(info, {
  stage: 'google-account', code: '10', httpStatus: 401,
  requestId: 'abcd1234abcd1234abcd1234abcd1234',
});
assert.strictEqual(atAuthStage('api-session', staged), staged);
assert.equal(staged.message.includes('PRIVATE'), false);
assert.equal(JSON.stringify(info).includes('private'), false);
assert.equal(JSON.stringify(staged).includes('PRIVATE'), false);
assert.deepEqual(
  authFailureInfo(atAuthStage('app-check', {
    code: 'token-includes-unsafe-whitespace and-private-info',
    requestId: 'some-one@example.invalid',
    status: 200,
  })),
  { stage: 'app-check', code: null, httpStatus: null, requestId: null },
);

const errors = read('src/features/auth/errors.ts');
const errorsJs = js(errors).replace(
  /from ['"]\.\/diagnostics['"]/g,
  'from "' + diagnosticsUrl + '"',
);
const { authErrorMessage } = await import(dataUrl(errorsJs));

assert.match(authErrorMessage(staged, 'en'), /Google rejected this build/);
assert.match(authErrorMessage(staged, 'es'), /google-account.*10/);
assert.match(
  authErrorMessage(atAuthStage('app-check', { code: 'app-check/token-invalid' }), 'es'),
  /verificación de seguridad.*app-check.*app-check\/token-invalid/,
);
assert.match(
  authErrorMessage(atAuthStage('api-session', { status: 401 }), 'en'),
  /LA Z.*api-session.*HTTP 401/,
);
assert.match(
  authErrorMessage(atAuthStage('firebase-credential', { code: 'auth/unrecognized' }), 'en'),
  /Firebase could not accept.*auth\/unrecognized/,
);
assert.doesNotMatch(authErrorMessage(staged, 'en'), /private|PRIVATE/);

// Google OAuth / Firebase failures must not be reported as password failures.
const googleFirebaseFailure = atAuthStage('google-firebase-credential', {
  code: 'auth/invalid-credential',
  message: 'PRIVATE_SHOULD_NOT_APPEAR',
});
const googleFirebaseError = authErrorMessage(googleFirebaseFailure, 'es');
assert.match(googleFirebaseError, /Firebase rechazó la credencial de Google/);
assert.match(googleFirebaseError, /google-firebase-credential.*auth\/invalid-credential/);
assert.doesNotMatch(googleFirebaseError, /[Cc]orreo o contraseña incorrectos|PRIVATE/);
assert.match(authErrorMessage(googleFirebaseFailure, 'en'), /Firebase rejected the Google sign-in credential/);
assert.match(
  authErrorMessage(atAuthStage('google-firebase-credential', { code: 'auth/some-new-code' }), 'es'),
  /Firebase no pudo completar el acceso con Google/,
);
assert.match(
  authErrorMessage({ code: 'auth/invalid-credential' }, 'es'),
  /Correo o contraseña incorrectos/,
);

const google = read('src/features/auth/google.ts');
const firebase = read('src/features/auth/firebase.ts');
const provider = read('src/features/auth/AuthProvider.tsx');
const screen = read('app/auth.tsx');
assert.match(google, /atAuthStage\('google-account', error\)/);
assert.match(google, /atAuthStage\('google-firebase-credential', error\)/);
assert.match(firebase, /atAuthStage\('app-check', error\)/);
assert.match(provider, /atAuthStage\('api-session', error\)/);
assert.match(screen, /LAZ_AUTH_GOOGLE_FAILURE/);

console.log('Auth failure stage diagnostics, safe logging and messages verified.');
