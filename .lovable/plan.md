
Adicionar novo preset F1 "O PAI TA ON" em `src/components/race/raceColors.ts`, no bloco F1 (após `power-girl`):

```ts
{ id: 'pai-ta-on', name: 'O PAI TA ON', style: 'f1', primary: '#0a0a0a', secondary: '#faff00', pattern: 'stripes', accent: '#faff00', emoji: '👑' }
```

Preto `#0a0a0a` base + amarelo neon `#faff00` nas listras/accent. Mesmo padrão visual do Black Thunder e Power Girl, mantendo consistência da trinca neon. Zero migração SQL.
