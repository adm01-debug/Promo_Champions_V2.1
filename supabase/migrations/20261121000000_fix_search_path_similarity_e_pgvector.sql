-- pg_trgm e pgvector vivem no schema `extensions` neste projeto, mas
-- match_semantic / search_products_semantic / search_products_vector declaram
-- SET search_path = public. Sem `extensions` no path, o Postgres não resolve
-- similarity() nem o operador de distância <=>, e as três funções falham em
-- runtime com 42883 ("function similarity(text, text) does not exist" /
-- "operator does not exist: extensions.vector <=> extensions.vector").
--
-- Efeito hoje: busca semântica (match_semantic) e busca vetorial/textual de
-- produtos (search_products_*) estão 100% quebradas em produção.
--
-- Corpo das funções não é alterado: só o search_path.

ALTER FUNCTION public.match_semantic(vector, integer, text[])
  SET search_path = public, extensions;

ALTER FUNCTION public.search_products_semantic(text[], text, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.search_products_vector(vector, integer)
  SET search_path = public, extensions;
