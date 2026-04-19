
Usuário quer inverter as cores do preset "Pink": carro **rosa neon como base** e **detalhes em preto** (atualmente está preto base + rosa nas listras).

Alterar em `src/components/race/raceColors.ts` o preset `pink`:

```ts
{ id: 'pink', name: 'Pink', style: 'f1', primary: '#ff10f0', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '💗' }
```

Rosa neon `#ff10f0` como cor primária (corpo) + preto `#0a0a0a` nas listras/accent. Zero migração SQL.
