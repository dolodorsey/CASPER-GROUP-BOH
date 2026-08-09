import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [appConfig, dynamicConfig, easConfig, clientSource, publicEnvironment, iosWorkflow, seedMigration] = await Promise.all([
  readFile(new URL('../app.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../app.config.js', import.meta.url), 'utf8'),
  readFile(new URL('../eas.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../lib/supabase.ts', import.meta.url), 'utf8'),
  readFile(new URL('../.env.production', import.meta.url), 'utf8'),
  readFile(new URL('../../.github/workflows/ios-release.yml', import.meta.url), 'utf8'),
  readFile(new URL('../../supabase/migrations/20260809011000_stock_casper_boh_operating_core.sql', import.meta.url), 'utf8'),
]);

assert.equal(appConfig.expo.ios.bundleIdentifier, 'app.rork.casper-boh');
assert.equal(appConfig.expo.android.package, 'app.rork.casper_boh');
assert.equal(easConfig.build.production.autoIncrement, true);
assert.match(clientSource, /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
assert.doesNotMatch(clientSource, /eyJhbGci|service_role|sb_secret_/);
assert.match(publicEnvironment, /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_/);
assert.doesNotMatch(publicEnvironment, /eyJhbGci|service_role|sb_secret_/);
assert.match(dynamicConfig, /process\.env\.EAS_PROJECT_ID/);
assert.match(iosWorkflow, /--non-interactive --auto-submit/);
assert.doesNotMatch(iosWorkflow, /workflow_dispatch/);
assert.match(seedMigration, /Stock CASPER BOH/);

console.log('CASPER BOH backend and release contracts verified.');
