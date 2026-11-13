import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { toast } from 'sonner';
import { RevenueLeakageCard } from './RevenueLeakageCard';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), info: vi.fn() } }));

describe('RevenueLeakageCard', () => {
  it('leva às vendas com markup crítico em vez de só exibir um toast', () => {
    render(
      <MemoryRouter>
        <RevenueLeakageCard
          totalLost={3000}
          discountLost={1000}
          competitorLost={1500}
          marginErosion={500}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /ver vendas com markup crítico/i });
    expect(link).toHaveAttribute('href', '/vendas?markup=critical');
    expect(screen.queryByRole('button', { name: /iniciar recuperação/i })).toBeNull();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
