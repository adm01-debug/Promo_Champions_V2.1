import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WinLossFilters } from "@/components/win-loss/WinLossFilters";
import { DEFAULT_WL_FILTERS } from "@/components/win-loss/winLossFiltersHelpers";

vi.mock("@/hooks/win-loss/useWinLossData", () => ({
  useActiveSalespeople: () => ({ data: [] }),
  useWinLossSegments: () => ({ data: [] }),
}));

function renderWith(props: Partial<React.ComponentProps<typeof WinLossFilters>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <WinLossFilters
        filters={DEFAULT_WL_FILTERS}
        onChange={() => {}}
        onReset={() => {}}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("WinLossFilters — reset view prefs button", () => {
  it("does not render the button when viewPrefsAreDefault is true", () => {
    renderWith({ onResetViewPrefs: () => {}, viewPrefsAreDefault: true });
    expect(screen.queryByText(/Restaurar visualização/i)).not.toBeInTheDocument();
  });

  it("does not render the button when onResetViewPrefs is not provided", () => {
    renderWith({ viewPrefsAreDefault: false });
    expect(screen.queryByText(/Restaurar visualização/i)).not.toBeInTheDocument();
  });

  it("renders the button when viewPrefsAreDefault is false", () => {
    renderWith({ onResetViewPrefs: () => {}, viewPrefsAreDefault: false });
    expect(screen.getByText(/Restaurar visualização/i)).toBeInTheDocument();
  });

  it("calls onResetViewPrefs when clicked and exposes a tooltip describing defaults", () => {
    const onResetViewPrefs = vi.fn();
    renderWith({ onResetViewPrefs, viewPrefsAreDefault: false });
    const btn = screen.getByRole("button", { name: /Restaurar visualização/i });
    expect(btn).toHaveAttribute("title", expect.stringMatching(/Mensal.*3 períodos/i));
    fireEvent.click(btn);
    expect(onResetViewPrefs).toHaveBeenCalledTimes(1);
  });
});
