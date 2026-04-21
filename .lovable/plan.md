

## Realçar reasons no debug com vínculo aos campos do breakdown

### Estado atual
`RiskDebugPanel` exibe `breakdown.reasons` como uma `<ul>` simples de bullets cinza — texto puro, sem indicação visual de qual sinal originou cada razão. Hoje o leitor precisa cruzar mentalmente:
- `"23 dias sem atualização (média de loss: 18d)"` ← `stagnation` + `days_stagnant` + `avg_loss_cycle_days`
- `"Ticket alinhado ao perfil típico de loss (45.000)"` ← `amount_alignment` + `avg_loss_amount`
- `"Estágio "Negociação" historicamente travado"` ← `stage_match` + `stage_eligible`
- `"Possível pressão competitiva detectada (concorrente, leilão)"` ← `matched_keywords`

As razões saem do edge function (`scoring.ts` linhas 258–274) com prefixos estáveis em PT-BR — basta classificar no client, sem mexer no servidor.

### O que será feito

**1. Helper local `classifyReason(reason, breakdown)` em `RiskDebugPanel.tsx`**
Retorna `{ kind, icon, badgeLabel, contribValue, contribMax, accent }` casando por regex case-insensitive:
- `/dias sem atualização/` → `stagnation` (ícone Clock, "Estagnação", value=`breakdown.stagnation`/50, accent amber)
- `/^ticket alinhado/` → `amount` (DollarSign, "Ticket", value=`breakdown.amount_alignment`/25, accent primary)
- `/estágio .* travado/` → `stage` (Layers, "Estágio", value=`breakdown.stage_match`/25, accent secondary)
- `/pressão competitiva/` → `competitor` (Swords, "Concorrência", value=`matched_keywords?.length`, accent destructive)
- fallback → `generic` (Info, "Sinal", sem contribuição numérica)

**2. Renderização rica das reasons**
Substituir o `<ul className="list-disc">` final por uma lista em que cada `<li>` contém:
- Ícone do tipo + Badge compacta (`"Estagnação 40/50"`, `tabular-nums`).
- Texto da razão com **trechos numéricos destacados** via helper `highlightNumbers(text)` que envolve matches de `\d[\d.,]*d?` em `<mark>` com classes `bg-primary/10 text-primary px-0.5 rounded font-medium tabular-nums` (sem amarelo nativo).
- Quando `kind === "competitor"`, cada keyword vira `<Badge variant="warning">` inline substituindo o trecho parentético.
- `aria-label` na `<li>` resume: `"Razão de risco: Estagnação, contribui 40/50"`.

**3. Conexão visual com o breakdown**
Manter o título "Razões" e adicionar subtítulo: `"cada item liga a um campo do cálculo acima"` em `text-muted-foreground text-[10px]`.

### Mudanças técnicas
- **Editar** `src/components/win-loss/RiskDebugPanel.tsx`: adicionar `KIND_META`, `classifyReason`, `highlightNumbers`, reescrever bloco "Razões".
- **Não tocar** em `scoring.ts`, edge function, hooks, fixtures, testes Deno ou qualquer outro arquivo — prefixos já são determinísticos no servidor.

### Verificação
1. Ativar Debug em deal de "Negociação travada" → 3 reasons com ícone+badge corretos; `23`, `18d`, `45.000` realçados em primary.
2. Deal com keywords competitivas → linha exibe ícone Swords e cada keyword como pill `warning`.
3. Reason fallback (`"Sinais cruzados de risco"`) → badge neutra "Sinal", sem contribuição, layout estável.
4. Inspeção a11y: cada `<li>` tem `aria-label` descritivo com nome do sinal e contribuição.
5. Trocar temporariamente o prefixo de uma reason em `scoring.ts` → a row cai para `generic` (prova que classificação é por prefixo, não global).

