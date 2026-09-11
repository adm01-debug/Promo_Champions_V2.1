# Graphify no Promo Champions

Esta integração cria um índice local e derivado para investigação técnica. Ela não substitui código, migrations, catálogo observado ou testes em runtime. A primeira etapa usa somente AST de código: não requer chave, não usa modelo e não envia conteúdo para provedores externos.

## Instalação reproduzível

O runtime está definido em `tools/graphify/pyproject.toml`. Em uma máquina com `uv` e Python entre 3.10 e 3.12:

```bash
uv sync --directory tools/graphify --locked
tools/graphify/.venv/bin/graphify --version
```

Enquanto a publicação interna do runtime não existir, a alternativa equivalente é `uv tool install graphifyy==0.9.48`. Não usar instalação sem versão fixada.

## Extração estrutural por domínio

```bash
GRAPHIFY_BIN="$PWD/tools/graphify/.venv/bin/graphify" \
  node scripts/graphify/extract-code-only.mjs --scope src/lib --max-workers 1
node scripts/graphify/verify-output.mjs --graph .graphify-local/lib/graphify-out/graph.json
```

O wrapper recusa caminho fora do repositório, link simbólico que sai da raiz, saída fora de `.graphify-local/`, versão inesperada, grafo corrompido e padrões comuns de segredo. Também exige confirmação explícita para escopos com mais de 500 arquivos. Os artefatos permanecem ignorados pelo Git.

O Graphify 0.9.48 pode representar imports externos — por exemplo `node:fs` — e imports para outro lote como endpoint sem nó local. O validador contabiliza relações `imports`, `imports_from`, `dynamic_import` e `re_exports` desse tipo e avisa; qualquer endpoint ausente em outra relação continua sendo erro.

O formato bruto preserva relações múltiplas, mas a consulta nativa pode reduzir relações entre o mesmo par de nós. O validador expõe esse risco; até o adaptador multigrafo estar validado, não use uma consulta do Graphify como prova única de impacto, permissão ou ausência de dependência.

Nesta fundação, cada `--out` deve ser novo. A CLI atual grava cache dentro da origem em uma atualização incremental com saída externa; por isso o wrapper recusa reutilizar snapshot até a etapa de atualização incremental ser validada contra renomes, remoções e concorrência. A recusa evita sujeira no código e não deve ser burlada com `--force`.

`--allow-large-scope` só é permitido após registrar a justificativa e a medição do lote. Não use `--force`, exportação para banco de grafos, hook automático, modo semântico ou conexão PostgreSQL sem a etapa correspondente do plano de 50 etapas.

## Limites operacionais

- O catálogo Supabase só será coletado por conexão de leitura identificada com o projeto canônico; hostname, proxy MCP ou ledger não bastam.
- A extração PostgreSQL nativa do Graphify não representa colunas. O adaptador de catálogo, RLS, grants, triggers, storage e jobs será testado em ambiente descartável antes de leitura do canônico.
- Ausência de aresta não prova código morto; referência estática não prova autorização ou sucesso em produção.
- Não publicar `graph.json`, HTML, cache ou relatório com conteúdo potencialmente sensível em artefato público.

Consulte o [plano de 50 etapas](../planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md) para gates e critérios de aceite.
