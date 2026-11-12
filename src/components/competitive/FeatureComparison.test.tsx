import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeatureComparison } from './FeatureComparison';

describe('FeatureComparison', () => {
  it('não oferece ações simuladas (PDF, compartilhar, roadmap) sem implementação real', () => {
    render(<FeatureComparison />);

    expect(screen.getByText(/market analysis/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /export pdf/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /share intel/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /executar roadmap/i })).toBeNull();
  });
});
