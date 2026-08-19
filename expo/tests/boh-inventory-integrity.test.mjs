import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync(new URL('../supabase/migrations/20260819024800_boh_inventory_menu_integrity.sql',import.meta.url),'utf8');
const hook=fs.readFileSync(new URL('../hooks/useSupabaseData.ts',import.meta.url),'utf8');

test('BOH inventory ranks operational risk before alphabetical display',()=>{
  assert.match(migration,/attention_score/);
  assert.match(migration,/last_counted<now\(\)-interval '7 days'/);
  assert.match(migration,/on_hand,0\)<coalesce\(i\.par,0\)/);
  assert.match(hook,/from\('cg_inventory_intelligence'\)/);
  assert.match(hook,/order\('attention_score', \{ ascending: false \}\)/);
});

test('operator menu availability is distinct from inventory verification',()=>{
  assert.match(migration,/operator_available/);
  assert.match(migration,/inventory_unverified/);
  assert.match(migration,/has_inventory_mapping/);
  assert.match(hook,/from\('cg_menu_integrity'\)/);
  assert.match(hook,/eq\('operator_available', true\)/);
  assert.doesNotMatch(hook,/from\('cg_menu_items'\).*eq\('is_available', true\)/s);
});
