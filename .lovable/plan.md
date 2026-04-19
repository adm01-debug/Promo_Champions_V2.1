
Adicionar novo preset F1 "Full Energy" em `src/components/race/raceColors.ts`, no bloco F1 (após `the-panther`):

```ts
{ id: 'full-energy', name: 'Full Energy', style: 'f1', primary: '#ffd60a', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' }
```

Amarelo vibrante `#ffd60a` base + preto `#0a0a0a` nas listras/accent. Estilo "abelha/hornet" alto-contraste. Zero migração SQL.
