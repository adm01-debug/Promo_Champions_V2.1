import assert from 'node:assert/strict';
import test from 'node:test';
import { extractCodeReferences, parseMigrationFile } from './static-contracts.mjs';

test('extrai referências literais entre código e Supabase', () => {
  const references = extractCodeReferences('exemplo.ts', `
    supabase.from('sales').select('*');
    supabase.schema('auth').from('users').select('*');
    supabase.rpc('sync_score');
    supabase.functions.invoke('notify-sale');
    supabase.storage.from('avatars');
    supabase.channel('sales-feed');
  `);
  assert.deepEqual(references.map(reference => [reference.kind, reference.name]), [
    ['table', 'public.sales'], ['table', 'auth.users'], ['rpc', 'sync_score'], ['edge_function', 'notify-sale'], ['storage_bucket', 'avatars'], ['realtime_channel', 'sales-feed'],
  ]);
});

test('registra SQL dinâmico em corpo de função como lacuna e não como objeto comprovado', () => {
  const parsed = parseMigrationFile('20260101000000_example.sql', `
    CREATE TABLE public.sales (id uuid primary key);
    CREATE FUNCTION public.build_table() RETURNS void LANGUAGE plpgsql AS $$
    BEGIN EXECUTE format('CREATE TABLE %I', dynamic_table); END;
    $$;
  `);
  assert.equal(parsed.version, '20260101000000');
  assert.deepEqual(parsed.events.map(event => [event.action, event.objectType, event.objectName]), [
    ['CREATE', 'table', 'public.sales'],
    ['CREATE', 'function', 'public.build_table'],
  ]);
  assert.equal(parsed.gaps.length, 1);
});

test('não interpreta comentário ou string como DDL e expõe ACL/RLS como lacuna', () => {
  const parsed = parseMigrationFile('20260101000000_example.sql', `
    -- CREATE TABLE public.falsa (id uuid);
    SELECT 'DROP TABLE public.falsa';
    ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin GRANT SELECT ON TABLES TO authenticated;
    ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
    CREATE POLICY p ON public.sales FOR SELECT USING (true);
    ALTER POLICY p ON public.sales TO authenticated;
    DROP POLICY p ON public.sales;
  `);
  assert.deepEqual(parsed.events.map(event => [event.action, event.objectType, event.objectName]), [
    ['ALTER', 'table', 'public.sales'],
    ['CREATE', 'policy', 'public.sales.p'],
    ['ALTER', 'policy', 'public.sales.p'],
    ['DROP', 'policy', 'public.sales.p'],
    ['ALTER', 'row_level_security', 'public.sales'],
  ]);
  assert.equal(parsed.gaps.some(gap => gap.includes('privilégios/ACL')), true);
  assert.equal(parsed.gaps.some(gap => gap.includes('RLS/policy')), false);
});

test('não confunde delimitadores de comentário dentro de literal com comentário SQL', () => {
  const parsed = parseMigrationFile('20260101000000_example.sql', `
    SELECT '/*';
    CREATE TABLE public.real (id uuid primary key);
    SELECT '*/';
  `);
  assert.deepEqual(parsed.events.map(event => [event.action, event.objectType, event.objectName]), [['CREATE', 'table', 'public.real']]);
});
