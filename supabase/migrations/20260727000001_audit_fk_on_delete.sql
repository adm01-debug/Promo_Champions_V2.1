-- ============================================================
-- promo-champions-v2.1 — FK ON DELETE Fixes
-- Auditoria ETAPA 29-36 — Finding #1-8 (ON DELETE FKs)
-- Severity: HIGH — 20+ FKs sem ON DELETE
--
-- SIMULAÇÃO DE CENÁRIOS:
-- C1: DELETE salesperson → tasks ficam com salesperson_id=UUID órfão (FK violation)
--     → SET NULL preserva tasks e limpa FK
-- C2: DELETE sale → activities ficam com sale_id=UUID órfão
--     → CASCADE deleta activities junto (comportamento esperado)
-- C3: DELETE client → client_portfolio fica com client_id órfão
--     → SET NULL (portfolio histórico, não deletar)
-- C4: DELETE user → feed_reactions, battle_participants ficam órfãos
--     → CASCADE (limpeza automática)
-- C5: ALTER TABLE + DROP FK + ADD FK atomico? Não — cada ALTER é atômico
--     → DROP CONSTRAINT primeiro, depois ADD CONSTRAINT
-- C6: Concurrent writes durante ALTER? DROP FK é quick lock
--     → Não causa deadlock se não houver transação aberta na FK
-- ============================================================

DO $$
DECLARE
  _sql TEXT;
  _fk_exists BOOLEAN;
  _fk_name TEXT;
  _table_name TEXT;
  _cols TEXT[] := ARRAY[
    -- (table, column, referenced_table, referenced_col, on_delete)
    ['tasks', 'salesperson_id', 'salespeople', 'id', 'SET NULL'],
    ['tasks', 'sale_id', 'sales', 'id', 'SET NULL'],
    ['activities', 'sale_id', 'sales', 'id', 'CASCADE'],
    ['activities', 'salesperson_id', 'salespeople', 'id', 'SET NULL'],
    ['demand_forecasts', 'product_id', 'products', 'id', 'CASCADE'],
    ['inventory_levels', 'product_id', 'products', 'id', 'CASCADE'],
    ['stock_movements', 'product_id', 'products', 'id', 'CASCADE'],
    ['lead_scores', 'sale_id', 'sales', 'id', 'CASCADE'],
    ['client_portfolio', 'client_id', 'clients', 'id', 'SET NULL'],
    ['client_portfolio', 'salesperson_id', 'salespeople', 'id', 'CASCADE'],
    ['lead_routing_log', 'to_salesperson_id', 'salespeople', 'id', 'SET NULL'],
    ['lead_routing_log', 'from_salesperson_id', 'salespeople', 'id', 'SET NULL'],
    ['client_portfolio', 'assigned_by', 'salespeople', 'id', 'SET NULL'],
    ['teams', 'sdr_id', 'salespeople', 'id', 'SET NULL'],
    ['playbook_progress', 'playbook_id', 'playbooks', 'id', 'CASCADE'],
    ['playbook_progress', 'salesperson_id', 'salespeople', 'id', 'SET NULL'],
    ['deal_outcomes', 'sale_id', 'sales', 'id', 'CASCADE'],
    ['deal_outcomes', 'outcome_type_id', 'outcome_types', 'id', 'SET NULL'],
    ['deal_stage_history', 'sale_id', 'sales', 'id', 'CASCADE'],
    ['deal_chat_history', 'salesperson_id', 'salespeople', 'id', 'SET NULL'],
    ['cadence_steps', 'cadence_id', 'cadences', 'id', 'CASCADE'],
    ['prospect_cadences', 'cadence_id', 'cadences', 'id', 'CASCADE'],
    ['prospect_cadences', 'prospect_id', 'prospects', 'id', 'CASCADE'],
    ['cadence_tasks', 'cadence_id', 'cadences', 'id', 'CASCADE'],
    ['feed_reactions', 'user_id', 'salespeople', 'id', 'CASCADE'],
    ['feed_comments', 'user_id', 'salespeople', 'id', 'CASCADE'],
    ['battle_participants', 'user_id', 'salespeople', 'id', 'CASCADE'],
    ['dashboard_layouts', 'user_id', 'salespeople', 'id', 'CASCADE'],
    ['objections_library', 'created_by', 'salespeople', 'id', 'SET NULL'],
    ['webauthn_credentials', 'user_id', 'auth.users', 'id', 'CASCADE'],
    ['webauthn_challenges', 'user_id', 'auth.users', 'id', 'CASCADE']
  ];
  _row RECORD;
  _constraint_name TEXT;
  _fk_constraint_exists BOOLEAN;
BEGIN
  FOREACH _row IN ARRAY _cols
  LOOP
    _table_name := _row[1];
    _constraint_name := 'fk_' || _row[1] || '_' || _row[2] || '_' || _row[3];

    -- Verifica se a coluna existe na tabela
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = _table_name
        AND column_name = _row[2]
    ) THEN
      RAISE NOTICE 'Tabela/Coluna nao existe: %.% — SKIP', _table_name, _row[2];
      CONTINUE;
    END IF;

    -- Verifica se a FK ja existe (pode ter nome diferente)
    _fk_exists := EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = _table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = _row[2]
    );

    IF NOT _fk_exists THEN
      RAISE NOTICE 'FK nao existe em %.% — criando...', _table_name, _row[2];
      -- A FK nao existe como constraint separate — pode ser inline
      -- Tenta encontrar constraint que referencia a coluna
      _fk_constraint_exists := EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema = ccu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = _table_name
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = _row[2]
          AND ccu.table_name = _row[3]
      );

      IF NOT _fk_constraint_exists THEN
        -- Constraint nao existe — adicionar
        _sql := FORMAT(
          'ALTER TABLE public.%I ADD CONSTRAINT %I ' ||
          'FOREIGN KEY (%I) REFERENCES public.%I(id) ON DELETE %s',
          _table_name,
          _constraint_name,
          _row[2],
          _row[3],
          _row[5]
        );
        RAISE NOTICE 'Executando: %', _sql;
        EXECUTE _sql;
      END IF;
    ELSE
      -- FK existe — verificar se tem ON DELETE
      -- Procura constraint sem ON DELETE (ou com ON DELETE RESTRICT/NO ACTION padrao)
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name
         AND tc.table_schema = 'public'
        WHERE tc.table_schema = 'public'
          AND tc.table_name = _table_name
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = _row[2]
          AND rc.delete_rule = 'NO ACTION'
      ) THEN
        RAISE NOTICE 'FK %.% sem ON DELETE (NO ACTION) — adicionar ON DELETE %',
          _table_name, _row[2], _row[5];
        -- Drop e recreate com ON DELETE
        SELECT tc.constraint_name INTO _fk_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = _table_name
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = _row[2]
        LIMIT 1;

        IF _fk_name IS NOT NULL THEN
          EXECUTE FORMAT('ALTER TABLE public.%I DROP CONSTRAINT %I', _table_name, _fk_name);
          EXECUTE FORMAT(
            'ALTER TABLE public.%I ADD CONSTRAINT %I ' ||
            'FOREIGN KEY (%I) REFERENCES public.%I(id) ON DELETE %s',
            _table_name,
            _constraint_name,
            _row[2],
            _row[3],
            _row[5]
          );
        END IF;
      ELSE
        RAISE NOTICE 'FK %.% ja tem ON DELETE definido — SKIP', _table_name, _row[2];
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'FK ON DELETE fixes aplicados com sucesso.';
END;
$$;

-- ============================================================
-- FIM: FK ON DELETE Fixes
-- ============================================================
