import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { CarPresetCard } from '../CarPresetCard';
import { RACE_CAR_PRESETS } from '../raceColors';

describe('CarPresetCard', () => {
  it('renders preset name and emoji', () => {
    const preset = RACE_CAR_PRESETS[0];
    render(<CarPresetCard preset={preset} selected={false} carNumber={7} onSelect={() => {}} />);
    expect(screen.getByText(preset.name)).toBeInTheDocument();
  });

  it('exposes accessible label', () => {
    const preset = RACE_CAR_PRESETS[0];
    render(<CarPresetCard preset={preset} selected={false} carNumber={1} onSelect={() => {}} />);
    expect(screen.getByLabelText(`Selecionar carro ${preset.name}`)).toBeInTheDocument();
  });

  it('calls onSelect with preset id on click', () => {
    const onSelect = vi.fn();
    const preset = RACE_CAR_PRESETS[2];
    render(<CarPresetCard preset={preset} selected={false} carNumber={3} onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText(`Selecionar carro ${preset.name}`));
    expect(onSelect).toHaveBeenCalledWith(preset.id);
  });

  it('reflects selected state via aria-pressed', () => {
    const preset = RACE_CAR_PRESETS[1];
    const { rerender } = render(
      <CarPresetCard preset={preset} selected={false} carNumber={1} onSelect={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(<CarPresetCard preset={preset} selected={true} carNumber={1} onSelect={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders SVG car preview', () => {
    const preset = RACE_CAR_PRESETS[0];
    const { container } = render(
      <CarPresetCard preset={preset} selected={false} carNumber={42} onSelect={() => {}} />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
