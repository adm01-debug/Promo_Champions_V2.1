import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AISalesCoachWidget } from "@/components/dashboard/widgets/AISalesCoachWidget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("AISalesCoachWidget", () => {
  it("renders loading state initially", () => {
    render(<AISalesCoachWidget />, { wrapper });
    expect(screen.getByText(/AI Sales Coach/i)).toBeDefined();
  });

  it("displays insights after loading", async () => {
    render(<AISalesCoachWidget />, { wrapper });
    // Since we're using a query, we'd normally mock the response.
    // In our implementation it's hardcoded for now, so it should appear.
    const insightTitle = await screen.findByText(/Lead Estagnado/i);
    expect(insightTitle).toBeDefined();
  });
});
