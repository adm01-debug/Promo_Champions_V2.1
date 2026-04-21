

## Presets de risco no `AtRiskSettingsPopover`

### Objetivo
Adicionar atalhos de 1 clique no popover de configurações para alternar `threshold` + `limit` entre 5 perfis pré-definidos. Hoje o usuário precisa arrastar dois sliders separadamente para mudar de "ver tudo" para "só os críticos".

### Presets (alinhados às bordas de `severityFromScore`)

| Preset      | threshold | limit | Intenção                          |
|-------------|----------:|------:|-----------------------------------|
| **Tudo**    |         0 |    50 | Auditoria total                   |
| **Baixo+**  |        40 |    20 | Default atual do sistema          |
| **Médio+**  |        50 |    20 | medium / high / critical          |
| **Alto+**   |        65 |    15 | high / critical                   |
| **Crítico** |        80 |    10 | só critical (alinha com severity) |

`maxVisible` **não** é alterado por preset (preferência puramente visual).
"Baixo+" casa com `AT_RISK_DEFAULTS` → ao abrir o sistema pela primeira vez o botão já fica destacado.

### UI

Novo bloco **Presets** no topo do popover, entre o header e o slider "Score mínimo":

```text
┌ Filtros de risco ─────────────────────────┐
│ Threshold 40 · 12 de 47                   │
├───────────────────────────────────────────┤
│ PRESETS                                   │
│ [Tudo][Baixo+][Médio+][Alto+][Crítico]    │  ← ToggleGroup horizontal
├───────────────────────────────────────────┤
│ Score mínimo                40            │
│ ─────●──────────                          │
│ ...                                       │
```

- `ToggleGroup type="single"`, botões `text-[10px] h-7 px-2` com `variant="outline"`.
- Ativo destacado via `data-state=on` (já no `toggleVariants`: `bg-accent text-accent-foreground`).
- Quando o usuário arrasta um slider e a combinação `(threshold, limit)` deixa de casar com qualquer preset, **nenhum** botão fica ativo (`value=""`).
- `title`/`aria-label` por botão: `"Threshold ≥40 · até 20 deals"`.

### Lógica

Helper puro novo `src/hooks/win-loss/atRiskPresets.ts`:

```ts
export type AtRiskPresetId = "all" | "low" | "medium" | "high" | "critical";

export interface AtRiskPreset {
  id: AtRiskPresetId;
  label: string;
  threshold: number;
  limit: number;
  description: string;
}

export const AT_RISK_PRESETS: readonly AtRiskPreset[] = [
  { id: "all",      label: "Tudo",    threshold: 0,  limit: 50, description: "Threshold ≥0 · até 50 deals" },
  { id: "low",      label: "Baixo+",  threshold: 40, limit: 20, description: "Threshold ≥40 · até 20 deals" },
  { id: "medium",   label: "Médio+",  threshold: 50, limit: 20, description: "Threshold ≥50 · até 20 deals" },
  { id: "high",     label: "Alto+",   threshold: 65, limit: 15, description: "Threshold ≥65 · até 15 deals" },
  { id: "critical", label: "Crítico", threshold: 80, limit: 10, description: "Threshold ≥80 · até 10 deals" },
] as const;

export function detectActivePreset(
  threshold: number,
  limit: number,
): AtRiskPresetId | null {
  return AT_RISK_PRESETS.find(p => p.threshold === threshold && p.limit === limit)?.id ?? null;
}
```

No `AtRiskSettingsPopover`:
- `const activePreset = detectActivePreset(settings.threshold, settings.limit);`
- `<ToggleGroup type="single" value={activePreset ?? ""} onValueChange={(id) => { const p = AT_RISK_PRESETS.find(x => x.id === id); if (p) onUpdate({ threshold: p.threshold, limit: p.limit }); }}>` com 5 `<ToggleGroupItem>`.

Sem cores hardcoded — usa tokens do design system via `toggleVariants`.

### Arquivos

**Novos**
- `src/hooks/win-loss/atRiskPresets.ts` (~35 linhas).
- `src/test/hooks/atRiskPresets.test.ts` — cobre:
  1. `AT_RISK_PRESETS` tem 5 entradas, ids únicos, ordem `all → critical`.
  2. `detectActivePreset` retorna o id correto para cada uma das 5 combinações exatas.
  3. `detectActivePreset(45, 20) === null` (entre presets).
  4. Thresholds dos presets coincidem com bordas de severity (40, 50, 65, 80).
  5. Defaults do `useAtRiskSettings` resolvem para preset `"low"`.

**Editado**
- `src/components/win-loss/AtRiskSettingsPopover.tsx` — importa presets, novo `<ToggleGroup>` no topo (~20 linhas adicionadas). Sliders existentes intocados.

### Critério de aceite
1. Abrir popover pela primeira vez → "Baixo+" destacado.
2. Clicar em "Crítico" → threshold=80 e limit=10 simultaneamente; lista re-filtra.
3. Arrastar slider para 45 → todos os botões neutros; sliders continuam funcionando.
4. Voltar slider para 40 → "Baixo+" volta a destacar.
5. `npm test -- atRiskPresets` verde.
6. Suite Deno do `detect-winloss-at-risk` permanece verde (zero mudança no backend).

