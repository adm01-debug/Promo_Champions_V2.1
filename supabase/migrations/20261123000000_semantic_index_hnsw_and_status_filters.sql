-- Bug: idx_semantic_index_embedding (ivfflat, lists=100) foi criado com a tabela
-- praticamente vazia. Uma lista ivfflat sem centroides treinados faz o planner
-- devolver zero linhas para qualquer ORDER BY embedding <=> query. Resultado:
-- match_semantic() retornava [] em producao mesmo com o indice populado.
-- HNSW nao depende de treinamento por lista e nao exige tuning de ivfflat.probes.
--
-- Este drop precisa ser reexecutado a cada deploy: a migration legada
-- 20260417123624_* usa CREATE INDEX IF NOT EXISTS, entao qualquer reapply dela
-- (banco restaurado, ambiente novo, branch de preview) recria o ivfflat quebrado
-- e o planner volta a escolhe-lo por ser menor. Nunca remover esta linha.
drop index if exists public.idx_semantic_index_embedding;

create index if not exists idx_semantic_index_embedding_hnsw
  on public.semantic_index
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

analyze public.semantic_index;