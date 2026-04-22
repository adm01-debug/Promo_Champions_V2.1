

## Persistir estado aberto/fechado do painel de auditoria

### Situação atual
- ✅ **bandMode** já é persistido (`winloss-scenario-bandmode`) — coberto por 9 testes em `ScenarioForecastPersistence.test.tsx`.
- ✅ **confidenceZ** persistido (`winloss-scenario-confidence-z`).
- ✅ **confidenceLevel PI** persistido (`winloss-scenario-pi-level`).
- ❌ **Estado expandido do painel de auditoria** — hoje usa `<details>` nativo, sem controle, então fecha a cada remount/reload.

### O que muda

#### 1. `src/components/win-loss/ScenarioForecastAuditPanel.tsx`

Trocar o `<details>` nativo por estado controlado com persistência local:

- Nova chave: `winloss-scenario-audit-open` (string `"1"` aberto / `"0"` fechado, default `"0"`).
- `useState<boolean>` inicializado **lazy** lendo o localStorage (mesmo padrão dos outros estados persistidos do gráfico — sem flicker no SSR/hidratação).
- `useEffect` grava ao mudar (com `try/catch` silencioso, igual `confidenceZ`).
- Sanitização: qualquer valor diferente de `"1"` cai para `false`.
- Renderização continua com `<details open={...}>` + `onToggle` para preservar acessibilidade nativa, semântica HTML e o ChevronDown rotacionando via `group-open:rotate-180` (já funciona com `open` controlado).

```tsx
const AUDIT_OPEN_KEY = "winloss-scenario-audit-open";
const [open, setOpen] = useState<boolean>(() => {
  try { return window.localStorage.getItem(AUDIT_OPEN_KEY) === "1"; }
  catch { return false; }
});
useEffect(() => {
  try { window.localStorage.setItem(AUDIT_OPEN_KEY, open ? "1" : "0"); }
  catch { /* noop */ }
}, [open]);

return (
  <details
    open={open}
    onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    className="group border-t border-border/60 px-4 py-2"
    aria-label="Painel de auditoria do ajuste de regressão"
  >
    {/* ... resto inalterado */}
  </details>
);
```

#### 2. Testes — `src/test/components/winloss/ScenarioForecastAuditPanelPersistence.test.tsx` (novo)

5 casos, mesmo padrão dos outros testes de persistência:

1. **Default fechado** quando localStorage vazio (`details.open === false`).
2. **Restaura aberto** quando `localStorage["winloss-scenario-audit-open"] === "1"`.
3. **Sanitiza valor inválido** (`"sim"`, `"true"`) → fechado.
4. **Toggle escreve no localStorage**: clicar no `<summary>` (`userEvent.click`) muda valor para `"1"`; clicar de novo volta para `"0"`.
5. **Sobrevive ao remount**: abrir, `cleanup()`, remontar → continua aberto.

Render helper reaproveita `ScenarioForecastChart` (igual aos outros testes), procura `screen.getByText("Auditoria do ajuste").closest("details")` para checar `open`.

### Não-mudanças
- `bandMode` / `confidenceZ` / `confidenceLevel` — já persistidos, intactos.
- Layout, tokens semânticos, sparkline de resíduos, fórmula PI colorida — sem alteração visual.
- Hook `useWinLossScenarios` — não toca.
- Suíte existente (52 + 5 OLS = 57 se ainda não aplicado) intacta.

### Critério de aceite
1. Abrir o painel, recarregar a página → painel continua aberto.
2. Fechar → continua fechado no próximo reload.
3. `localStorage.getItem("winloss-scenario-audit-open")` reflete o estado atual em tempo real.
4. Valor corrompido na chave não quebra o componente (cai para fechado).
5. Suíte Win/Loss verde com 5 novos testes (≥ 57 totais).

