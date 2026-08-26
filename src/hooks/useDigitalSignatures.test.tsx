import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
const toast = vi.fn();

vi.mock("@/integrations/supabase/client", () => {
  const builder = () => {
    const query = {
      select: () => query,
      order: () => query,
      insert: () => query,
      update,
      delete: () => query,
      eq: () => query,
      limit: () => query,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (value: { data: never[]; error: null }) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };

    update.mockReturnValue(query);
    return query;
  };

  return {
    supabase: {
      from: () => builder(),
    },
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast }),
}));

const { DIGITAL_SIGNATURE_INTEGRATION_MESSAGE, useDigitalSignatures } = await import("./useDigitalSignatures");

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useDigitalSignatures sem provedor configurado", () => {
  beforeEach(() => {
    update.mockClear();
    toast.mockClear();
  });

  it("não altera o status ao tentar enviar um documento", async () => {
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await expect(result.current.sendForSignature.mutateAsync("documento-1")).rejects.toThrow(
        DIGITAL_SIGNATURE_INTEGRATION_MESSAGE,
      );
    });

    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Envio para assinatura indisponível", variant: "destructive" }),
    );
  });

  it("não permite registrar assinatura ou recusa pelo cliente", async () => {
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await expect(
        result.current.updateSignerStatus.mutateAsync({ signerId: "signatario-1", status: "signed" }),
      ).rejects.toThrow(DIGITAL_SIGNATURE_INTEGRATION_MESSAGE);
    });

    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Confirmação de assinatura indisponível", variant: "destructive" }),
    );
  });
});
