
Add a new F1-style preset "Cooper League" to `RACE_CAR_PRESETS` in `src/components/race/raceColors.ts`, mirroring the colors of "Stock Forest" (green primary, white secondary, tree emoji 🌲) but with `style: 'f1'`.

New entry:
```ts
{ id: 'cooper-league', name: 'Cooper League', style: 'f1', primary: '#15803d', secondary: '#ffffff', pattern: 'stripes', accent: '#ffffff', emoji: '🌲' }
```

(Exact hex values will match the existing Stock Forest entry once read.)
