import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const orderRows = [
  {
    id: "order-1",
    order_number: "ORC-20260826-00000001",
    status: "confirmed",
    total: 1250.5,
    created_at: "2026-08-20T12:00:00.000Z",
    updated_at: "2026-08-22T14:30:00.000Z",
    cancellation_reason: null,
    client: { name: "Cliente real" },
  },
];

vi.mock("@/integrations/supabase/client", () => {
  const builder = () => {
    let orderId: string | undefined;
    const query = {
      select: () => query,
      order: () => query,
      limit: () => query,
      eq: (column: string, value: string) => {
        if (column === "id") orderId = value;
        return query;
      },
      maybeSingle: () =>
        Promise.resolve({
          data: orderRows.find((row) => row.id === orderId) ?? null,
          error: null,
        }),
      then: (resolve: (value: { data: typeof orderRows; error: null }) => unknown) =>
        Promise.resolve({ data: orderRows, error: null }).then(resolve),
    };

    return query;
  };

  return {
    supabase: {
      from: () => builder(),
    },
  };
});

const { useOrderTracking, useOrderTrackingDetail } = await import("./useOrderTracking");

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useOrderTracking", () => {
  it("retorna somente pedidos persistidos, sem complementar a listagem com mocks", async () => {
    const { result } = renderHook(() => useOrderTracking(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: "order-1",
        orderNumber: "ORC-20260826-00000001",
        clientName: "Cliente real",
        totalValue: 1250.5,
        createdAt: "2026-08-20T12:00:00.000Z",
        updatedAt: "2026-08-22T14:30:00.000Z",
        status: "confirmed",
        cancellationReason: null,
      },
    ]);
  });

  it("consulta o detalhe diretamente, sem depender do limite da listagem", async () => {
    const { result } = renderHook(() => useOrderTrackingDetail("order-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.orderNumber).toBe("ORC-20260826-00000001");
    expect(result.current.data?.status).toBe("confirmed");
  });
});
