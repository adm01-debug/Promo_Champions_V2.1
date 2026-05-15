import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const { mockSupabase } = vi.hoisted(() => {
  return {
    mockSupabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    }
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

vi.mock("@/hooks/semantic/useIndexEntity", () => ({
  useIndexEntity: () => ({ index: vi.fn() }),
}));

vi.mock("@/hooks/race/useRaceTrigger", () => ({
  triggerRaceEvent: vi.fn(),
}));

vi.mock("@/hooks/useSystemSoundSettings", () => ({
  useSystemSoundSettings: () => ({ playSoundForCategory: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

import { useSalesData, useCreateSale } from "@/hooks/useSalesData";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useSalesData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and transforms sales data correctly", async () => {
    const mockData = [
      {
        id: "12345678-1234-1234-1234-123456789012",
        client_name: "Test Client",
        product_name: "Test Product",
        amount: 1000,
        status: "pending",
        created_at: new Date().toISOString(),
        client_id: "c1",
        product_id: "p1",
        salesperson_id: "s1",
        sku: "SKU-001"
      }
    ];

    (mockSupabase.limit as any).mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useSalesData(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    const sale = result.current.data![0];
    expect(sale.id).toBe("12345678");
    expect(sale.valor).toBe(1000);
    expect(sale.statusLabel).toBe("Pendente");
  });
});

describe("useCreateSale", () => {
  it("successfully creates a sale and invalidates queries", async () => {
    (mockSupabase.single as any).mockResolvedValue({ 
      data: { id: "new-id", status: "completed" }, 
      error: null 
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    await result.current.mutateAsync({
      client_name: "New Client",
      product_name: "New Product",
      amount: 500,
    });

    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Venda criada com sucesso!");
  });
});
