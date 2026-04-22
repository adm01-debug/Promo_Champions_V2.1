

## Botão "Restaurar padrões de visualização" (granularidade + horizonte)

### Contexto
- `useWinLossViewPrefs.reset()` já existe e restaura `granularity: "month"` + `forecastHorizon: 3`, limpando o localStorage. Já coberto por teste no hook.
- Falta apenas um botão na UI que chame `reset()` — hoje só há um botão "Limpar" para os filtros de dados (vendedores/segmento/período/valor), não para as preferências de visualização.

### O que muda

**1. `src/components/win-loss/WinLossFilters.tsx`**
- Novas props opcionais: `onResetViewPrefs?: () => void` e `viewPrefsAreDefault?: boolean`.
- Renderizar botão discreto ao lado do "Limpar" existente, **apenas** quando `viewPrefsAreDefault === false`:
  ```tsx
  {!viewPrefsAreDefault && onResetViewPrefs && (
    <Button size="sm" variant="ghost" className="h-8"
      onClick={onResetViewPrefs}
      title="Restaura granularidade (Mensal) e horizonte (3 períodos)">
      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurar visualização
    </Button>
  )}
  ```
- Ícone `RotateCcw` (lucide), tokens semânticos, `variant="ghost"` para não competir com o "Limpar".

**2. `src/pages/WinLossIntelligence.tsx`**
- Calcular `viewPrefsAreDefault` comparando com `VIEW_PREFS_DEFAULTS` (já exportado).
- Passar `onResetViewPrefs` que chama `resetViewPrefs()` + dispara `toast({ title: "Preferências restauradas", description: "Granularidade Mensal · Horizonte 3 períodos" })` para feedback.

**3. Testes — `src/test/components/winloss/WinLossFiltersResetView.test.tsx` (novo)**
4 casos:
1. Botão **não** aparece quando `viewPrefsAreDefault === true`.
2. Botão **aparece** quando `viewPrefsAreDefault === false`.
3. Clicar dispara `onResetViewPrefs`.
4. Botão tem `title` (tooltip nativo) descrevendo os defaults.

### Não-mudanças
- Hook `useWinLossViewPrefs` intacto (já tem `reset`).
- Botão "Limpar" dos filtros de dados intacto.
- Sem chaves novas de localStorage.

### Critério de aceite
1. Mudo granularidade ou horizonte → botão "Restaurar visualização" aparece nos filtros.
2. Clico nele → granularidade volta para Mensal, horizonte para 3, gráficos remontam, toast confirma.
3. Recarrego a página → defaults persistem (localStorage foi limpo).
4. Estou nos defaults → botão fica oculto (sem ruído visual).
5. Suíte Win/Loss verde com 4 novos testes (≥ 61 totais).

