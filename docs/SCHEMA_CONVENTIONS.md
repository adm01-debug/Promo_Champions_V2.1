# SCHEMA CONVENTIONS — Convenções de banco (Promo Champions V2.1)

Convenções obrigatórias para novas tabelas, colunas e funções.
Referenciada pelo CLAUDE.md §1 (regras de migration).

## Tabelas e colunas

- **Nomes**: `snake_case`, plural para entidades (`clients`, `pipeline_stages`),
  singular para mapas/dicionários (`feature_flags` é exceção histórica).
- **Chave primária**: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`.
- **Timestamps**: sempre `timestamptz` (`timestamp with time zone`),
  nunca `timestamp` sem fuso. `created_at`/`updated_at` NOT NULL
  `DEFAULT now()` em toda tabela.
- **Dinheiro**: `NUMERIC(15,2)` (nunca `float`/`real`; legado usa
  `DECIMAL(12,2)` — não aumentar a divergência).
- **Booleans**: `boolean` com default explícito.
- **FKs**: `REFERENCES public.<tabela>(id)` com `ON DELETE` explícito
  (`CASCADE` para filhos, `SET NULL` para referências opcionais).
- **JSONB livre**: permitido para metadados (`metadata jsonb DEFAULT '{}'`),
  proibido para dados consultados por filtro — esses viram coluna indexada.

## Segurança (obrigatório em toda tabela nova)

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` sempre.
- Policy mínima: autenticado lê o próprio dado OU admin/manager via
  `public.is_admin_or_manager(auth.uid())` / `public.has_role(auth.uid(), 'admin')`.
- Nunca recriar policy `USING (true)` aberta a `anon` (hardening de
  2026-08-31 removeu todas).
- Funções privilegiadas: `SECURITY DEFINER` + `SET search_path = public`
  + `REVOKE ALL ... FROM PUBLIC, anon` + `GRANT` mínimo + checagem de role
  no corpo. Preferir `SECURITY INVOKER` quando possível.

## updated_at obrigatório

Toda tabela mutável tem trigger:

```sql
CREATE TRIGGER update_<tabela>_updated_at
  BEFORE UPDATE ON public.<tabela>
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## Migrations

- Arquivo `supabase/migrations/YYYYMMDDHHMMSS_<descricao>.sql`, versão
  estritamente crescente (conferir `ls supabase/migrations | tail`).
- Comentário descritivo em pt-BR no topo do arquivo.
- `CREATE INDEX` simples — `CONCURRENTLY` falha no gateway transacional.
- Idempotente: `IF NOT EXISTS`, `DROP ... IF EXISTS`, `ON CONFLICT DO NOTHING`,
  `to_regclass`/guards `EXCEPTION WHEN` quando houver risco de drift.
- Correção nunca edita migration histórica já aplicada — vai em arquivo novo.
