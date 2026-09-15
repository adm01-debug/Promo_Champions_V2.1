# Baseline AST de `src` — Graphify

Data: 11/09/2026. Entrada: `src/` no commit de código `2dfd57b30bd7de9d73f950e1885e2357dc59d4c3`. Execução local, com `graphifyy` 0.9.48, `--code-only --no-cluster --max-workers 2 --allow-large-scope`. Nenhum modelo, provedor externo, banco ou Edge Function foi executado.

## Resultado reproduzível

| Métrica | Valor |
| --- | ---: |
| Arquivos de código extraídos | 2.035 |
| Arquivos não classificados | 2 CSS (`index.css`, `winloss-print.css`) |
| Nós brutos | 9.349 |
| Relações brutas | 38.217 |
| Relações EXTRACTED | 38.093 |
| Relações INFERRED | 124 |
| Imports sem nó local | 5.595 |
| Pares com relações múltiplas | 270 |
| Relações potencialmente colapsadas pela consulta nativa | 270 |
| Autoarestas | 0 |
| Duplicatas exatas | 0 |

O snapshot está em `.graphify-local/full-src-ast/graphify-out/`, que é deliberadamente ignorado pelo Git. A métrica de “imports sem nó local” não significa erro de aplicação: inclui dependências externas e referências que o resolvedor não materializou como nó local. Ela é uma limitação registrada, não evidência de código morto.

## Consulta de fumaça

A consulta limitada por orçamento para `RevenueForecastV2` localizou, entre outros, estes nós e fontes:

- `RevenueForecastV2()` em `src/pages/RevenueForecastV2.tsx`;
- rota lazy em `src/routes/lazyPages.ts` e composição em `src/routes/AppRoutes.tsx`;
- `computeRevenueForecast()` e `applyWhatIf()` em `src/lib/revenueForecast/forecastEngine.ts`;
- `buildRevenueForecastCsv()` em `src/lib/revenueForecast/csvExport.ts`;
- `useRevenueHistory()` em `src/hooks/revenue/useRevenueHistory.ts`.

Isso prova relações estáticas presentes no índice, não autorização, chamada bem-sucedida, cobertura de runtime ou estado do banco.

## Achados de integridade

1. A carga para um grafo dirigido simples teria 32.352 arestas válidas contra 32.622 relações com endpoints locais: 270 relações diferem apenas por relação/contexto para o mesmo par de nós. O arquivo bruto as conserva, mas `query`, `path` e `affected` podem reduzi-las. Não usar essas consultas como fonte única para impacto até o adaptador multigrafo da etapa 16.
2. A CLI não materializou 5.595 endpoints de importação no grafo bruto completo. O wrapper os anuncia como pendência de resolução e continua rejeitando qualquer endpoint ausente de relação que não seja importação.
3. Como há 9.349 nós, não foi gerado HTML nem clusterização. A skill recomenda não abrir visualização plena acima de 5.000 nós sem estratégia de agregação. A etapa 35 decidirá visualização privada agregada.

## Próximos gates

- Construir adaptador de relações múltiplas e teste de equivalência antes de habilitar consultas de impacto.
- Extrair e tratar migrations SQL em lote separado; as 611 migrations não cabem no limite atual de um único escopo e não devem ser confundidas com schema aplicado.
- Somente depois ligar referências frontend, Edge, RPC e catálogo Supabase. A comparação com banco canônico continua bloqueada até uma sessão RO confirmar o projeto `usyxfpqlsspldubptrdl`.
