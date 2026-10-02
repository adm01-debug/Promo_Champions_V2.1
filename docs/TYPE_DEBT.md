# TYPE_DEBT — débito de tipagem do frontend

Documento vivo do pacote de tipagem da auditoria. Registra o que já é
contrato, as baselines ainda abertas e o plano para zerá-las.

## Convenções (fonte de verdade)

1. **Linhas de tabelas/views do Supabase** vêm do arquivo gerado
   `src/integrations/supabase/types.ts` — use `Tables<'nome'>`,
   `TablesInsert<'nome'>`, `TablesUpdate<'nome'>`, `Enums<'nome'>`.
   Não declare interfaces locais que dupliquem ou inventem colunas.
2. `src/types/` guarda **view-models** (ex.: `Sale` em `types/sales.ts`, com
   campos camelCase montados para a UI) e aliases compatíveis com o schema
   gerado. Não é lugar para descrever linha de tabela.
3. Leituras do Supabase nunca usam `as unknown as T`:
   - quando o `select` já retorna o Row certo, retorne `data ?? []` direto;
   - quando a forma precisa de estreitamento (Json → struct, `string` →
     union, select parcial), use `parseRows`/`parseRow` de
     `src/lib/supabase/parseRows.ts` — a asserção fica centralizada e
     auditável num único lugar;
   - para payloads `Json` de escrita, use `toJson` (ou `insertPayload`/
     `updatePayload` de `src/lib/supabase/typed-payloads.ts`);
   - formas genuinamente dinâmicas recebem schema **zod** (`rowsWith`).
4. Status de domínio moram em `src/constants/index.ts`:
   `SALE_STATUS` + `WON_SALE_STATUSES`/`LOST_SALE_STATUSES` com os helpers
   `isWonSaleStatus`/`isLostSaleStatus`/`isOpenSaleStatus`, e
   `WIN_LOSS_OUTCOME` para o campo `outcome` das tabelas `win_loss_*`.
   Comparações usam os helpers/constantes — nunca literal solto.
5. Schemas zod compartilhados (`src/lib/schemas/`, `_shared/`) não usam
   `z.any()`: `z.unknown()` para valores opacos, schema real quando a forma
   é conhecida.

## Baseline `as unknown`

| marco | ocorrências | arquivos |
|-------|-------------|----------|
| antes do pacote | 219 | 138 |
| após este pacote | **155** | **122** |

Os ~15 maiores ofensores foram corrigidos neste pacote (leituras do
Supabase, RPC `fn_convert_quote_to_sale`, casts de client inteiro,
`lastAutoTable` do jspdf, mocks de `vi.fn` em teste).

### Plano para o restante (~155 ocorrências)

Todo `as unknown` restante já está individualmente suprimido por
`eslint-disable-next-line no-restricted-syntax` — ou seja, cada site é
ponto único e auditável. Ordem sugerida de ataque:

1. **Leituras do Supabase** (maioria): trocar `(data ?? []) as unknown as
   T[]` por `parseRows<T>(data)` ou remover o cast quando o Row já bate.
2. **Casts de client inteiro** (`supabase as unknown as {...}`): tabelas
   ausentes do types gerado → regenerar os tipos (o banco já tem a tabela)
   ou, quando a tabela realmente não existir, declarar a view/table e
   regenerar.
3. **`as never` em `.from()`**: mesmo tratamento — tabela fora do arquivo
   gerado indica types.ts desatualizado.
4. **Mocks de teste** (`x as unknown as ReturnType<typeof vi.fn>`):
   `vi.mocked(x)` + helper `queryResult` (ver `src/pages/Index.test.tsx`).

**Não** substituir por cast pior (`as any`, `@ts-ignore`) nem silenciar a
regra globalmente — o padrão suprimido por site é intencional.

## Baseline de flags estritas

`tsconfig.strict.json` liga `noUncheckedIndexedAccess`, `noUnusedLocals`
e `noUnusedParameters` **só na compilação paralela** — o `tsconfig.app.json`
segue como está até a contagem zerar.

| grupo | erros na baseline (882 total) |
|-------|-------------------------------|
| `noUncheckedIndexedAccess` (TS18048 ×383, TS2532 ×346, TS2538 ×6, TS2488 ×1) | 736 |
| `noUnusedLocals` / `noUnusedParameters` (TS6133) | 13 |
| erros de atribuição expostos pelas flags (TS2345 ×73, TS2322 ×49, TS2339 ×2, TS2769 ×3, TS6196 ×2, TS2604 ×2, TS2786 ×2) | 133 |

Os números exatos vivem em `scripts/typecheck-baseline.json`
(`npm run typecheck:baseline` — roda no CI de PR e **reprova apenas erros
novos**). Corrigiu débito? `npm run typecheck:baseline:update` e commite o
JSON. Zerou uma flag? Mova-a para `tsconfig.app.json` e remova do strict.

### Plano

- `TS6133` (~15): declarados `_x` de propósito morto — deletar as
  declarações.
- `TS2532`/`TS18048` (~700): indexação dinâmica `obj[key]`/`arr[i]` sem
  checagem. Corrigir por domínio (BI/reporting primeiro — maior risco de
  `undefined` em produção), preferindo `.at()`, `Object.hasOwn`, narrowing
  ou fallback explícito `?? padrão`.
- Quando uma flag zerar, promovê-la para `tsconfig.app.json` torna o
  endurecimento permanente sem baseline.

## Literais de status ainda soltos (~35)

Domínios fora do escopo deste pacote que ainda comparam literal solto —
criar constante por domínio conforme o padrão de `SALE_STATUS`/
`WIN_LOSS_OUTCOME`:

- `goals.status`, `tasks.status`, `activities.status` (`=== 'completed'`);
- `orders.status` (`=== 'completed'`);
- `battles/matchups.status`, `bets.status` (`=== 'completed'/'won'`);
- `quote_cadence_items.status`, `onboarding_tracks.status`;
- `pipeline_stages.id === 'won'` (stage, não status);
- `AudioContext.state === 'closed'` (DOM, não domínio de venda — manter).
