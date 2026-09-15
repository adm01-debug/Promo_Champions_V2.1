import assert from 'node:assert/strict';
import test from 'node:test';
import { extractCodeReferences, parseMigrationFile } from './static-contracts.mjs';

test('extrai referências literais entre código e Supabase', () => {
  const references = extractCodeReferences('exemplo.ts', `
    supabase.from('sales').select('*');
    supabase.rpc('sync_score');
    supabase.functions.invoke('notify-sale');
    supabase.storage.from('avatars');
    supabase.channel('sales-feed');
  `);
  assert.deepEqual(references.map(reference => [reference.kind, reference.name]), [
    ['table', 'sales'], ['rpc', 'sync_score'], ['edge_function', 'notify-sale'], ['storage_bucket', 'avatars'], ['realtime_channel', 'sales-feed'],
  ]);
});

test('registra SQL dinâmico como lacuna e não como objeto comprovado', () => {
  const parsed = parseMigrationFile('20260101000000_example.sql', `
    CREATE TABLE public.sales (id uuid primary key);
    EXECUTE format('CREATE TABLE %I', dynamic_table);
  `);
  assert.equal(parsed.version, '20260101000000');
  assert.deepEqual(parsed.events.map(event => [event.action, event.objectType, event.objectName]), [['CREATE', 'table', 'public.sales']]);
  assert.equal(parsed.gaps.length, 1);
});
