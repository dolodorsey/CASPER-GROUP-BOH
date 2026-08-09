import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../../supabase/migrations/20260809011000_stock_casper_boh_operating_core.sql', import.meta.url), 'utf8');
const approvedSlugs = [
  'angel-wings', 'pasta-bish', 'taco-yaki', 'patty-daddy', 'espresso-co',
  'tha-morning-after', 'tossd', 'sweet-tooth', 'mojo-juice', 'mr-oyster',
  'peace-pizza', 'american-dragon',
];

test('BOH operating core contains all twelve brands without fabricated KPIs', () => {
  for (const slug of approvedSlugs) assert.match(migration, new RegExp(`'${slug}'`));
  assert.doesNotMatch(migration, /insert into public\.cg_kpis/i);
  assert.doesNotMatch(migration, /insert into public\.cg_reports_daily/i);
});

test('BOH mock and template integration files are removed', () => {
  assert.equal(existsSync(new URL('../mocks/washingtonParq.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../lib/trpc.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../lib/brainClient.ts', import.meta.url)), false);
});

test('BOH seed is idempotent', () => {
  assert.match(migration, /where not exists/gi);
});
