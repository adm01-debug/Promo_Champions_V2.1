import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RaceCalmProvider, useRaceCalm } from './RaceCalmContext';

function Consumer({ label }: { label: string }) {
  const { calm, toggle } = useRaceCalm();
  return (
    <button type="button" onClick={toggle}>
      {`${label}:${calm ? 'on' : 'off'}`}
    </button>
  );
}

describe('RaceCalmContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('com provider, mantém uma única assinatura para vários consumidores', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    render(
      <RaceCalmProvider>
        <Consumer label="a" />
        <Consumer label="b" />
        <Consumer label="c" />
      </RaceCalmProvider>
    );

    const subscriptions = addEventListener.mock.calls.filter(
      ([type]) => type === 'race-calm-mode-change'
    );
    expect(subscriptions).toHaveLength(1);

    addEventListener.mockRestore();
  });

  it('com provider, um consumidor alterna e os outros veem o mesmo estado', () => {
    render(
      <RaceCalmProvider>
        <Consumer label="a" />
        <Consumer label="b" />
      </RaceCalmProvider>
    );

    fireEvent.click(screen.getByText('a:off'));

    expect(screen.getByText('a:on')).toBeDefined();
    expect(screen.getByText('b:on')).toBeDefined();
    expect(window.localStorage.getItem('race_calm_mode')).toBe('1');
  });

  it('fora do provider, o consumidor segue funcionando sozinho', () => {
    render(<Consumer label="solo" />);

    fireEvent.click(screen.getByText('solo:off'));

    expect(screen.getByText('solo:on')).toBeDefined();
    expect(window.localStorage.getItem('race_calm_mode')).toBe('1');
  });
});
