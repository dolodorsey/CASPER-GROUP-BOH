import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/20260901041024_casper_boh_security_invoker_views.sql', import.meta.url),
  'utf8',
);

test('Casper BOH intelligence views execute with caller-context RLS', () => {
  assert.match(migration, /alter view public\.cg_inventory_intelligence\s+set \(security_invoker = true\)/i);
  assert.match(migration, /alter view public\.cg_menu_integrity\s+set \(security_invoker = true\)/i);
});

test('Casper BOH view hardening migration is non-destructive and brand-scoped', () => {
  assert.doesNotMatch(migration, /\b(drop|truncate|delete\s+from)\b/i);
  assert.doesNotMatch(migration, /\b(noir|good_times|mission_365|sos_)\b/i);
});
