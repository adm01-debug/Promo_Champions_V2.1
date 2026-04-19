
Adicionar novo preset F1 "Black Thunder" em `src/components/race/raceColors.ts`:

```ts
{ id: 'black-thunder', name: 'Black Thunder', style: 'f1', primary: '#0a0a0a', secondary: '#39ff14', pattern: 'stripes', accent: '#39ff14', emoji: '⚡' }
```

Inserir no final do bloco F1 (após `alpine-azure`). Verde neon `#39ff14` como secundária + accent nas listras sobre o preto. Mantém `RACE_CAR_PRESETS` ordenado por categoria.

Sem outras mudanças. Zero migração SQL.
