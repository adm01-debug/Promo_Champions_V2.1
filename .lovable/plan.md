

## Persistência do modo debug no painel "Deals em risco"

### Diagnóstico
A persistência **já existe e funciona** — a auditoria do código mostra:

- `useAtRiskSettings` (`src/hooks/win-loss/useAtRiskSettings.ts`) já tem `debug: boolean` no schema (v2), grava em `localStorage` (chave `winloss-at-risk-settings`) via `useEffect` e re-hidrata na inicialização via `read()`.
- `AtRiskSettingsPopover` liga o `Switch` "Modo debug" diretamente a `onUpdate({ debug: v })`, sem state local efêmero.
- `AtRiskDealsFromPatterns` consome `settings.debug` direto do hook persistido.
- `useAtRiskSettings.test.ts` cobre: persistência do flag debug, migração v1→v2 preservando valor default, sanitização booleana.

Resultado: ao recarregar a página, `settings.debug` volta com o último valor escolhido. **Nada falta na persistência.**

### O gap real
O que falta é **feedback visual** de que o modo debug está ligado quando o popover está fechado — hoje o usuário não sabe se reativou ou não sem reabrir o popover. Vou adicionar isso.

### Mudanças

**1. `src/components/win-loss/AtRiskSettingsPopover.tsx`**
- No `PopoverTrigger`, adicionar um pequeno indicador (ícone `Bug` 10px ou ponto âmbar) ao lado do badge `≥{threshold}` quando `settings.debug === true`.
- Atualizar `aria-label` do trigger para incluir "debug ativo" quando ligado.
- Atualizar `title` para refletir estado.

**2. `src/components/win-loss/AtRiskDealsFromPatterns.tsx`**
- Quando `settings.debug` estiver ativo, exibir uma `Badge` discreta `variant="outline"` com ícone `Bug` no header do card (ao lado do título "Deals em risco — padrões de loss"), clicável para desligar rapidamente via `update({ debug: false })`. Isso dá:
  - Confirmação visual imediata pós-reload de que o modo persistiu.
  - Atalho para sair do modo sem reabrir o popover.

**3. `src/test/hooks/useAtRiskSettings.test.ts`**
- Adicionar 1 teste explícito: "debug flag survives remount" — montar o hook, ligar debug, desmontar, remontar e verificar `settings.debug === true` (simula reload).

### Critérios de aceite
1. Ligar debug → recarregar página (F5) → painel renderiza com debug já ativo, sem clique extra.
2. Header do card mostra badge `Bug "Debug"` quando ativo; some quando desligado.
3. Trigger do popover mostra dot/ícone âmbar quando debug ativo (visível mesmo com popover fechado).
4. Clicar na badge do header desliga debug e remove a badge instantaneamente; valor persiste como `false` em `localStorage`.
5. Testes de hook (incluindo o novo "survives remount") passam.

### Arquivos tocados
- `src/components/win-loss/AtRiskSettingsPopover.tsx` (indicador no trigger)
- `src/components/win-loss/AtRiskDealsFromPatterns.tsx` (badge no header + atalho)
- `src/test/hooks/useAtRiskSettings.test.ts` (teste de remount)

