# Execução Graphify — lote A

Data: 11/09/2026. Base: `bd6a2b1deb0d04f1d761510c1d66cf5f8f117a7f`, branch isolada `feat/hermes-graphify-fundacao`.

Este registro separa o que foi realmente executado das etapas futuras do [plano de 50 etapas](../planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md). Não houve leitura ou escrita no Supabase, alteração de hook, automação de commit, chamada a modelo ou mudança no produto.

## Resultado do lote

Foi entregue parte da fundação local das etapas 05–10: runtime Graphify 0.9.48 bloqueado por `uv.lock`, wrapper de extração AST somente código, validação de artefato, regras de exclusão, testes Node e gate de CI para os testes do wrapper. A decisão formal da etapa 04, o suporte incremental completo da etapa 09 e as etapas 01–03 permanecem parciais; 11–50 permanecem pendentes.

O ambiente detectou 2.037 arquivos em `src/`, distribuídos em 1.259 componentes, 494 hooks, 174 páginas e 61 arquivos em `src/lib`. Em `supabase/`, há 611 migrations e 289 arquivos em `functions/`. Estes números orientam a partição; não são contagem de funções implantadas, objetos ativos nem evidência de cobertura funcional.

## Simulações executadas

| Cenário | Resultado observado | Decisão |
| --- | --- | --- |
| Corpus sintético com import dinâmico | 3 arquivos TypeScript geraram 7 nós e 14 arestas, sem endpoint ausente ou colapso | A extração AST local é viável sem LLM |
| Import de módulos nativos | 4 scripts geraram 16 nós, 37 arestas e 10 referências externas `ref_node_*` | São imports externos explícitos; o validador alerta, mas não os confunde com órfão interno |
| Aresta interna sem nó | Teste unitário a recusa | Integridade continua bloqueante para lacuna interna |
| Segredo sintético em `.env.example` | Não apareceu no grafo de fixture | `.env.*` deixou de ter exceção no `.graphifyignore` |
| Escopo com 2.037 arquivos | Wrapper recusou sem `--allow-large-scope` | Extrair por domínio antes de qualquer execução ampla |
| Reuso de saída externa | A CLI atual cria cache no diretório de origem em modo incremental | Wrapper recusa reutilizar `--out`; atualização incremental fica bloqueada até a etapa 19 |
| Link simbólico e saída fora da raiz | Cobertos pelo wrapper e testes | Caminhos externos são recusados |

O cache de simulação criado indevidamente pela CLI sob `scripts/graphify/graphify-out/` foi movido para diretório temporário local antes do commit. Ele não é necessário para o projeto e pode ser removido fora do repositório após a revisão; nenhum arquivo versionado foi apagado.

## Validações aprovadas

| Comando | Resultado |
| --- | --- |
| `uv lock --directory tools/graphify --check` | aprovado, 35 pacotes resolvidos |
| `npm run graphify:test` | 6 testes aprovados |
| `npm run lint` | aprovado |
| `npm run typecheck` | aprovado |
| `npm test` | 516 aprovados, 2 ignorados intencionalmente |
| `npm run security:secrets` | aprovado; não é auditoria histórica completa |
| `deno lint` | 288 arquivos verificados |
| `npm run build` | aprovado; aviso preexistente em `AbcPieChart.tsx` sobre importação estática e dinâmica |

## Controles adicionados

- O runtime Python fica em `tools/graphify/`, sem dependência no bundle Vite.
- Saídas locais ficam em `.graphify-local/`, ignoradas pelo Git; cache Graphify também é ignorado como defesa adicional.
- A extração exige versão exata, escopo interno existente, saída interna e nova, tamanho explícito e validação do JSON final.
- Padrões de segredo comuns bloqueiam a validação sem revelar o valor encontrado.
- O CI executa somente os testes do wrapper neste lote. Não baixa Graphify, não processa o repositório nem recebe segredo de produção.

## Limitações e próximos gates

- Ainda falta dividir `src/components` em lotes abaixo de 500 arquivos, executar baseline AST por domínio e validar renomes/remoções antes de permitir incremental.
- O adaptador de catálogo precisa ser testado em banco descartável. Coleta do canônico depende de confirmar identidade do projeto `usyxfpqlsspldubptrdl` e de sessão somente leitura; não será substituída por proxy MCP não verificado.
- Semântica, MCP, hooks, visualização, workflow de extração, artefatos e alertas permanecem desabilitados até seus gates específicos.
- A etapa 50 exige três PRs e sete dias de uso real; não é possível considerá-la concluída nesta entrega.
