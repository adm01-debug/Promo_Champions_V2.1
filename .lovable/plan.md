
Adicionar novo preset F1 "Power Girl" em `src/components/race/raceColors.ts`, no bloco F1 (após `black-thunder`):

```ts
{ id: 'power-girl', name: 'Power Girl', style: 'f1', primary: '#0a0a0a', secondary: '#ff1493', pattern: 'stripes', accent: '#ff1493', emoji: '💖' }
```

Preto `#0a0a0a` como base + rosa neon `#ff1493` nas listras/accent. Mesmo padrão visual do Black Thunder, mantendo consistência. Zero migração SQL.
