import { describe, it, expect } from 'vitest';
import { COMBO_TIERS, comboService } from './comboService';

describe('comboService.getComboTier', () => {
  it('retorna o maior tier cujo minActions foi atingido', () => {
    expect(comboService.getComboTier(0).label).toBe('Normal');
    expect(comboService.getComboTier(2).label).toBe('Normal');
    expect(comboService.getComboTier(3).label).toBe('Aquecendo');
    expect(comboService.getComboTier(4).label).toBe('Aquecendo');
    expect(comboService.getComboTier(5).label).toBe('Em Chamas!');
    expect(comboService.getComboTier(8).label).toBe('Imparável!');
    expect(comboService.getComboTier(12).label).toBe('LENDÁRIO!');
    expect(comboService.getComboTier(99).label).toBe('LENDÁRIO!');
  });

  it('não há gap entre tiers: todo count mapeia para algum tier', () => {
    for (let n = 0; n <= 20; n++) {
      expect(COMBO_TIERS).toContain(comboService.getComboTier(n));
    }
  });
});

describe('comboService.getComboTierIndex', () => {
  it('retorna o índice do tier atual', () => {
    expect(comboService.getComboTierIndex(0)).toBe(0);
    expect(comboService.getComboTierIndex(3)).toBe(1);
    expect(comboService.getComboTierIndex(12)).toBe(COMBO_TIERS.length - 1);
    expect(comboService.getComboTierIndex(1000)).toBe(COMBO_TIERS.length - 1);
  });
});

describe('comboService.getNextTier', () => {
  it('aponta o próximo tier quando ainda não está no topo', () => {
    expect(comboService.getNextTier(0)?.minActions).toBe(3);
    expect(comboService.getNextTier(11)?.minActions).toBe(12);
  });

  it('retorna null no tier máximo', () => {
    expect(comboService.getNextTier(12)).toBeNull();
    expect(comboService.getNextTier(500)).toBeNull();
  });
});

describe('COMBO_TIERS invariantes', () => {
  it('minActions é monotonicamente crescente e começa em 0', () => {
    expect(COMBO_TIERS[0]!.minActions).toBe(0);
    for (let i = 1; i < COMBO_TIERS.length; i++) {
      expect(COMBO_TIERS[i]!.minActions).toBeGreaterThan(COMBO_TIERS[i - 1]!.minActions);
    }
  });

  it('multiplicador só aumenta ao subir de tier', () => {
    for (let i = 1; i < COMBO_TIERS.length; i++) {
      expect(COMBO_TIERS[i]!.multiplier).toBeGreaterThan(COMBO_TIERS[i - 1]!.multiplier);
    }
  });
});
