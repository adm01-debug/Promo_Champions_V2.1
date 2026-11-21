-- Bug: idx_semantic_index_embedding (ivfflat, lists=100) foi criado com a tabela
-- praticamente vazia. Uma lista ivfflat sem centroides treinados faz o planner
-- devolver zero linhas para qualquer ORDER BY embedding <=> query. Resultado:
-- match_semantic() retornava [] em producao mesmo com o indice populado.
-- HNSW nao depende de treinamento por lista e nao exige tuning de ivfflat.probes.
drop index if exists public.idx_semantic_index_embedding;

create index if not exists idx_semantic_index_embedding_hnsw
  on public.semantic_index
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);