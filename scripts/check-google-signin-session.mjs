import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const read = (path) => readFileSync(path, 'utf8');
const account = read('app/profile/settings/account.tsx');
const auth = read('app/auth.tsx');
const authProvider = read('src/features/auth/AuthProvider.tsx');
const google = read('src/features/auth/google.ts');
const appConfig = read('app.config.js');
const pkg = JSON.parse(read('package.json'));

assert.match(account, /Alert\.alert\(/);
assert.match(account, /'¿Cerrar sesión\?'/);
assert.match(account, /'Cancelar'/);
assert.match(account, /style: 'cancel'/);
assert.match(account, /style: 'destructive'/);
assert.match(account, /onPress: \(\) => \{/);
assert.match(account, /void signOut\(\)/);
assert.match(account, /\.catch\(/);
assert.match(account, /disabled=\{working\}/);

assert.match(auth, /Ya tengo cuenta/);
assert.match(auth, /loginEmail/);
assert.match(auth, /loginPassword/);
assert.match(auth, /Continuar con Google/);
assert.match(auth, /signInWithGoogle\(/);
assert.match(auth, /if \(completed\) router\.replace\('\/profile'\)/);
assert.match(authProvider, /signInWithGoogle: \(\) => Promise<boolean>/);
assert.match(authProvider, /const user = await signInFirebaseGoogle\(\)/);
assert.match(authProvider, /if \(!user\) return false/);
assert.match(authProvider, /await synchronize\(user\)/);
assert.match(authProvider, /clearGoogleAccountSelection\(\)/);

assert.match(google, /EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID/);
assert.match(google, /GoogleSignin\.configure\(/);
assert.match(google, /webClientId\?\.endsWith/);
assert.match(google, /GoogleSignin\.signIn\(\)/);
assert.match(google, /if \(!isSuccessResponse\(response\)\) return null/);
assert.match(google, /GoogleSignin\.getTokens\(\)/);
assert.match(google, /selectGoogleCredentialTokens\(\{ idToken, accessToken \}\)/);
assert.match(google, /GoogleAuthProvider\.credential\(/);
assert.match(google, /tokens\.idToken/);
assert.match(google, /tokens\.accessToken/);
assert.match(google, /signInWithCredential\(getAuth\(getApp\(\)\), googleCredential\)/);
assert.doesNotMatch(google, /auth\/google-configuration-required/);

// Behavioral unit tests of the pure TypeScript token-selection policy, without
// mocking Firebase or placing real OAuth tokens in CI.
const tsSource = read('src/features/auth/google-credential.ts');
const compiled = ts.transpileModule(tsSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64');
const { selectGoogleCredentialTokens } = await import(moduleUrl);

assert.deepEqual(
  selectGoogleCredentialTokens({ idToken: ' ID ', accessToken: ' ACCESS ' }),
  { kind: 'idToken', idToken: 'ID', accessToken: null },
  'prefer Google ID token when configured',
);
assert.deepEqual(
  selectGoogleCredentialTokens({ idToken: null, accessToken: ' ACCESS ' }),
  { kind: 'accessToken', idToken: null, accessToken: 'ACCESS' },
  'use Google Access Token when Metro lacks OAuth Web Client ID',
);
assert.deepEqual(
  selectGoogleCredentialTokens({ idToken: '   ', accessToken: ' ACCESS ' }),
  { kind: 'accessToken', idToken: null, accessToken: 'ACCESS' },
);
assert.throws(
  () => selectGoogleCredentialTokens({ idToken: null, accessToken: '  ' }),
  (error) => error.code === 'auth/google-token-unavailable',
  'no Firebase session may be created from empty Google credentials',
);
assert.doesNotMatch(google, /createUserWithEmailAndPassword/);
assert.doesNotMatch(google, /linkWithCredential/);

assert.equal(pkg.dependencies['@react-native-google-signin/google-signin'], '^16.1.5');
assert.match(appConfig, /'@react-native-google-signin\/google-signin'/);
assert.match(appConfig, /com\.neuromarket\.laz1310/);
console.log('LA Z Google OAuth integration and sign-out confirmation invariants OK.');
