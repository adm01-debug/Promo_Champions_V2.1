import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { CustomerSuccess360Hub } from "./CustomerSuccess360Hub";
import { useCustomerSuccess360 } from "@/hooks/customer-success/useCustomerSuccess360";
import { useToast } from "@/hooks/use-toast";
import "@testing-library/jest-dom";

// Mock hooks
vi.mock("@/hooks/customer-success/useCustomerSuccess360", () => ({
  useCustomerSuccess360: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

// Mock react-helmet-async
vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock jsPDF
vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    save: vi.fn(),
    autoTable: vi.fn(),
  }))
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

vi.mock("papaparse", () => ({
  default: { unparse: vi.fn(() => "mock-csv") },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockData = {
  summary: {
    avg_health_v2: 85, total_accounts: 10, open_tickets: 5, urgent_tickets: 1,
    renewals_90d: 4, renewals_30d: 2, renewals_at_risk: 1, renewals_at_risk_value: 15000,
    avg_csat: 4.5, avg_ces: 4.2, onboarding_active: 3, onboarding_stalled: 0,
    onboarding_completed: 10, expansion_opportunities: 5, expansion_pipeline_value: 25000,
    upcoming_qbrs_30d: 2,
  },
  accounts: [
    { id: "1", name: "Account A", tier: "Enterprise", health_v2: 90, annual_revenue: 50000, open_tickets: 1 },
    { id: "2", name: "Account B", tier: "Pro", health_v2: 70, annual_revenue: 20000, open_tickets: 2 },
  ],
  tickets: [], renewals: [], usage: [], onboarding: [], expansion: [], surveys: [], qbrs: [],
  orders: [
    { id: "o1", account_id: "1", order_number: "ORD-001", status: "delivered", total: 1000, created_at: new Date().toISOString() },
    { id: "o2", account_id: "2", order_number: "ORD-002", status: "cancelled", total: 500, created_at: new Date().toISOString(), cancellation_reason: "Erro no pedido" },
  ],
};

describe("CustomerSuccess360Hub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData, isLoading: false, isError: false, refetch: vi.fn()
    });
  });

  it("renders loading state with skeletons", () => {
    (useCustomerSuccess360 as any).mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<CustomerSuccess360Hub />);
    expect(screen.getByTestId("loading-skeletons")).toBeInTheDocument();
  });

  it("renders error state with retry option", async () => {
    const refetch = vi.fn();
    (useCustomerSuccess360 as any).mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error("Falha"), refetch });
    render(<CustomerSuccess360Hub />);
    expect(screen.getByText(/Algo deu errado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("validates status filter updates results in modal", async () => {
    render(<CustomerSuccess360Hub />);
    fireEvent.click(screen.getByText("Pedidos"));
    
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    expect(await screen.findByText(/ORD-001/)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", { name: /Fechar/ }));
    fireEvent.click(screen.getByTestId("ver-detalhes-cancelled"));
    expect(await screen.findByText(/ORD-002/)).toBeInTheDocument();
  });

  it("displays no results when there are no orders", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: { ...mockData, orders: [] }, isLoading: false, isError: false
    });
    render(<CustomerSuccess360Hub />);
    fireEvent.click(screen.getByText("Pedidos"));
    expect(await screen.findByText(/Nenhum pedido encontrado/)).toBeInTheDocument();
  });

  it("confirms table sorting by Cliente", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: {
        ...mockData,
        orders: [
          { id: "o1", account_id: "1", order_number: "A-01", status: "delivered", total: 10, created_at: "2024-01-01T10:00:00Z" },
          { id: "o2", account_id: "2", order_number: "B-01", status: "delivered", total: 20, created_at: "2024-01-02T10:00:00Z" },
        ]
      },
      isLoading: false, isError: false
    });
    render(<CustomerSuccess360Hub />);
    fireEvent.click(screen.getByText("Pedidos"));
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    
    const header = await screen.findByText("Cliente");
    fireEvent.click(header); // ASC
    let rows = await screen.findAllByRole("row");
    expect(rows[1]).toHaveTextContent("Account A");
    
    fireEvent.click(header); // DESC
    rows = await screen.findAllByRole("row");
    expect(rows[1]).toHaveTextContent("Account B");
  });

  it("verifies pagination updates displayed items", async () => {
    const orders = Array.from({ length: 15 }, (_, i) => ({
      id: `p${i}`, account_id: "1", order_number: `PAG-${i}`, status: "delivered", total: 10, created_at: new Date(Date.now() - i*1000).toISOString()
    }));
    (useCustomerSuccess360 as any).mockReturnValue({
      data: { ...mockData, orders }, isLoading: false, isError: false
    });
    render(<CustomerSuccess360Hub />);
    fireEvent.click(screen.getByText("Pedidos"));
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    
    await screen.findAllByText(/PAG-/);
    fireEvent.click(await screen.findByRole("button", { name: "2" }));
    expect(await screen.findByText(/PAG-10/)).toBeInTheDocument();
  });

  it("verifies modal fields correspond to selected order", async () => {
    render(<CustomerSuccess360Hub />);
    fireEvent.click(screen.getByText("Pedidos"));
    fireEvent.click(screen.getByTestId("ver-detalhes-cancelled"));
    
    const modal = await screen.findByRole("dialog");
    expect(within(modal).getByText(/ORD-002/)).toBeInTheDocument();
    expect(within(modal).getAllByText(/Account B/)[0]).toBeInTheDocument();
    expect(within(modal).getByText(/500/)).toBeInTheDocument();
    expect(within(modal).getByText(/Erro no pedido/)).toBeInTheDocument();
  });
});