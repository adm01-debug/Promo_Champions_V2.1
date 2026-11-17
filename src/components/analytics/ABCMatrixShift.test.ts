import { describe, expect, it } from 'vitest';
import { buildAbcMatrixShifts } from './ABCMatrixShift';

type Cls = 'A' | 'B' | 'C';
const item = (name: string, revenue: number, classification: Cls) => ({
  name,
  revenue,
  percentage: 0,
  cumulativePercentage: 0,
  classification,
});

describe('buildAbcMatrixShifts', () => {
  it('não gera nada quando falta uma das janelas', () => {
    expect(buildAbcMatrixShifts([], [])).toEqual([]);
    expect(buildAbcMatrixShifts([item('A Ltda', 10, 'A')], [])).toEqual([]);
    expect(buildAbcMatrixShifts([], [item('A Ltda', 10, 'A')])).toEqual([]);
  });

  it('ignora cliente que não mudou de classe', () => {
    expect(
      buildAbcMatrixShifts([item('A Ltda', 200, 'A')], [item('A Ltda', 100, 'A')])
    ).toEqual([]);
  });

  it('ignora cliente ausente de uma das janelas (sem comparação possível)', () => {
    expect(
      buildAbcMatrixShifts([item('Novo', 500, 'A')], [item('Antigo', 100, 'C')])
    ).toEqual([]);
  });

  it('reporta subida de classe com a variação medida e as duas receitas', () => {
    const [shift] = buildAbcMatrixShifts(
      [item('Cresceu', 150, 'A')],
      [item('Cresceu', 100, 'C')]
    );
    expect(shift.from).toBe('C');
    expect(shift.to).toBe('A');
    expect(shift.changePct).toBeCloseTo(50);
    expect(shift.reason).toContain('150');
    expect(shift.reason).toContain('100');
  });

  it('reporta queda de classe com variação negativa', () => {
    const [shift] = buildAbcMatrixShifts(
      [item('Caiu', 40, 'C')],
      [item('Caiu', 100, 'A')]
    );
    expect(shift.from).toBe('A');
    expect(shift.to).toBe('C');
    expect(shift.changePct).toBeCloseTo(-60);
  });

  it('ordena pela maior variação absoluta', () => {
    const shifts = buildAbcMatrixShifts(
      [item('Pouco', 110, 'A'), item('Muito', 300, 'A')],
      [item('Pouco', 100, 'B'), item('Muito', 100, 'C')]
    );
    expect(shifts.map(s => s.name)).toEqual(['Muito', 'Pouco']);
  });

  it('não divide por zero quando a janela anterior tinha receita 0', () => {
    const [shift] = buildAbcMatrixShifts(
      [item('Zerado', 100, 'A')],
      [item('Zerado', 0, 'C')]
    );
    expect(Number.isFinite(shift.changePct)).toBe(true);
    expect(shift.changePct).toBe(100);
  });
});
