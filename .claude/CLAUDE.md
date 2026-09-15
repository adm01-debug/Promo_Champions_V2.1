# Graphify

- **graphify** (`.claude/skills/graphify/SKILL.md`) transforma código e documentos em grafo. Gatilho: `/graphify`.
- Para impacto, use apenas `multigraph.json` de um snapshot identificado por `snapshot.json`; consulte a fonte indicada antes de concluir uma alteração.
- `npm run graphify:contracts -- --out .graphify-local/<arquivo>.json` coleta relações estáticas de código e migrations. SQL dinâmico e referências não literais devem permanecer como lacunas.
- O Graphify não amplia permissões: catálogo Supabase, dados, deploys e escrita continuam sujeitos às regras e aos acessos já existentes.
