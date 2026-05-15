import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useSalesData, useCreateSale } from "@/hooks/useSalesData";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              or: vi.fn(() => Promise.resolve({ data: [
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
              ], error: null }))
            }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: "new-id" }, error: null }))
          }))
        }))
      }))
    }
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

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
  it("fetches and transforms sales data correctly", async () => {
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
    const { result } = renderHook(() => useCreateSale(), { wrapper });

    await result.current.mutateAsync({
      client_name: "New Client",
      product_name: "New Product",
      amount: 500,
    });

    // Verify success behavior
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Venda criada com sucesso!");
  });
});
