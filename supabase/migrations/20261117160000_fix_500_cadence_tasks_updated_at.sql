-- 500 em toda chamada de process-cadence-tasks: a RPC de claim escreve numa
-- coluna que nunca existiu.
--
-- CAUSA RAIZ (medida em producao, 2026-11-17, somente leitura):
--   SELECT * FROM public.claim_pending_cadence_tasks(current_date, 20);
--   ERROR 42703: column "updated_at" of relation "cadence_tasks" does not exist
--   CONTEXT: PL/pgSQL function claim_pending_cadence_tasks(date,integer) line 3
--
--   A funcao veio da migration 20260718000003_add_claim_pending_cadence_tasks.sql
--   com `SET status='processing', updated_at = now()`, mas nenhuma migration deste
--   repo jamais criou cadence_tasks.updated_at: as 11 colunas em producao sao id,
--   prospect_cadence_id, cadence_step_id, scheduled_date, status, completed_at,
--   notes, created_at, call_result, priority, task_type.
--
--   O erro e de plano do PL/pgSQL, entao acontece em TODA invocacao, inclusive com
--   a tabela vazia (0 linhas hoje). A edge function faz `if (claimErr) throw` e cai
--   no catch final, que responde 500 opaco -- o que o navegador mostra como
--   "POST .../process-cadence-tasks 500 (Internal Server Error)" na tela Cadencias.
--   Ou seja: o processamento automatico de cadencias nunca funcionou.
--
-- CONSERTO ESCOLHIDO: criar a coluna, nao reescrever a funcao.
--   1. AGENTS.md 7 exige `updated_at` em toda tabela; cadence_tasks e a excecao.
--   2. Preserva a intencao da funcao (saber QUANDO a tarefa foi reivindicada),
--      util para achar linha presa em 'processing'.
--   3. Tabela com 0 linhas: ADD COLUMN com DEFAULT nao reescreve dados e nao tem
--      custo de lock relevante.
--
-- Trigger: `update_updated_at_column` e a convencao dominante do repo (127 triggers)
--   e e a que as tabelas irmas usam (update_cadences_updated_at,
--   update_prospect_cadences_updated_at). Sem ela, updated_at congelaria no insert
--   em qualquer UPDATE que nao seja o da RPC.

ALTER TABLE public.cadence_tasks
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_cadence_tasks_updated_at ON public.cadence_tasks;
CREATE TRIGGER update_cadence_tasks_updated_at
  BEFORE UPDATE ON public.cadence_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Verificacao: falha a migration se o conserto nao tiver efeito.
DO $$
DECLARE n int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema='public' AND table_name='cadence_tasks' AND column_name='updated_at'
  ) THEN
    RAISE EXCEPTION 'cadence_tasks.updated_at nao foi criada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
      JOIN pg_namespace ns ON ns.oid=c.relnamespace
     WHERE NOT t.tgisinternal AND ns.nspname='public'
       AND c.relname='cadence_tasks' AND t.tgname='update_cadence_tasks_updated_at'
  ) THEN
    RAISE EXCEPTION 'trigger update_cadence_tasks_updated_at nao foi criada';
  END IF;

  -- Prova direta de que o 42703 acabou: executa a propria RPC que estourava.
  -- Nao reivindica nada indevidamente -- so pega tarefa 'pending'/'automatic'
  -- vencida de cadencia ativa, e marca 'processing', que e exatamente o que o
  -- processador faria na proxima execucao.
  SELECT count(*) INTO n FROM public.claim_pending_cadence_tasks(current_date, 1);
  RAISE NOTICE 'claim_pending_cadence_tasks executou sem erro (reivindicou % tarefa(s))', n;
END
$$;
