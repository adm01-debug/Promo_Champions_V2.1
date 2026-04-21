

## Testes carregando fixtures reais e validando included, score band, razões e ações

### Estado atual
A suíte `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` já carrega `SCENARIOS` + `LOSS_PATTERNS_REALISTIC` e valida tudo isso por cenário:
- `included` (filtro com threshold 40 → `null` quando excluído).
- `minScore`/`maxScore` + range global 0–100.
- `patternTypeOneOf` (pattern dominante).
- `reasonsInclude` (substrings em `result.reasons`).
- `actionIncludes` (string OU `string[]` OR-semântico em `result.suggested_action`).
- Meta-teste anti-regressão garantindo que todo cenário incluído declare `actionIncludes`.

Resultado atual: **43 testes verdes**, 11 cenários cobertos.

### O que falta para fechar o pedido
A cobertura hoje é cenário-a-cenário. Falta um **conjunto de asserções tabulares de alto nível** que prove, num único bloco legível, que toda a tabela de fixtures é honrada — útil como "documentação executável" e porta de entrada para revisão. Também falta validar explicitamente que cenários **excluídos com score > 0** mantêm o score abaixo do threshold (não apenas que retornam `null`).

### O que será implementado

Adicionar ao final de `scenarios_test.ts` três testes agregados que carregam os fixtures de uma vez e percorrem a tabela inteira:

**1. `"fixtures table: included flag matches threshold filter"`**
Para cada cenário roda `computeDealRisk(deal, LOSS_PATTERNS_REALISTIC, NOW, 40)` e monta `{name, expectedIncluded, gotIncluded}`. Assert único compara as duas listas e imprime divergências (se houver) num diff legível.

**2. `"fixtures table: every included scenario respects minScore/maxScore + 0–100"`**
Itera só os incluídos, coleta violações (`score < min`, `score > max`, `score fora de [0,100]`) num array, falha com mensagem agregada listando todas de uma vez (em vez de parar no primeiro como o teste por-cenário).

**3. `"fixtures table: reasons & action substrings present per scenario"`**
Itera os incluídos, verifica `reasonsInclude` (todas) e `actionIncludes` (string = AND single, array = OR), agrega falhas e reporta em uma só mensagem multi-linha.

**4. `"fixtures table: excluded scenarios with non-null computation stay below threshold"`**
Para os cenários `included: false`, roda com `threshold: 0` para forçar resultado e assertar `score < 40`. Garante que a exclusão é por score real, não por bug de retorno cedo.

Todos os 4 testes reusam helpers locais (`includesCI`, normalização de `actionIncludes`) já presentes no arquivo — sem código novo de produção, só asserções.

### Mudanças
- **Modificar**: `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` — adicionar 4 `Deno.test` agregados ao final do arquivo (~80 linhas). Sem mudança em `fixtures.ts`, `scoring.ts` ou no edge function.

### Verificação
1. `supabase--test_edge_functions` em `["detect-winloss-at-risk"]` → **47 testes verdes** (43 atuais + 4 novos agregados).
2. Mexer em `minScore` de qualquer cenário para forçar violação → teste #2 reporta o cenário e os números num único erro consolidado.
3. Trocar `included: true` → `false` num cenário que entra → teste #1 imprime o diff `expected vs got`.
4. Encurtar uma string em `suggestedActionFor` quebrando uma substring esperada → teste #3 lista cenário + needle + ação real.

