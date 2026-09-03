import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../../supabase/migrations/20260903001700_casper_boh_revoke_noncrud_view_grants.sql', import.meta.url),
  'utf8',
);

test('Casper BOH view privilege hardening removes non-CRUD browser capabilities', () => {
  assert.match(migration, /c\.relkind\s+in\s*\('v',\s*'m'\)/i);
  assert.match(migration, /c\.relname\s*~\s*'\^cg_'/i);
  assert.match(migration, /revoke truncate, references, trigger on table/i);
  assert.match(migration, /from anon, authenticated/i);
});

test('Casper BOH view privilege hardening is non-destructive and parent-scope only', () => {
  assert.doesNotMatch(migration, /\b(drop\s+(table|view)|delete\s+from|truncate\s+table|update\s+public\.|insert\s+into)\b/i);
  assert.doesNotMatch(migration, /\b(noir|good_times|mission_365|sos_|tempo|on_call|luxe)\b/i);
});
