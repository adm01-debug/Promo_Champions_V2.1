import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CustomerSuccess360Hub } from "./CustomerSuccess360Hub";
import { useCustomerSuccess360 } from "@/hooks/customer-success/useCustomerSuccess360";
import { useToast } from "@/hooks/use-toast";
import "@testing-library/jest-dom";

// Mock the hooks
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

// Mock ResizeObserver for Recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock jsPDF and PapaParse
vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    save: vi.fn(),
    autoTable: vi.fn(),
  })),
}));

vi.mock("papaparse", () => ({
  default: {
    unparse: vi.fn(() => "mock-csv-content"),
  },
}));

// Mock framer-motion to disable animations in tests
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
    avg_health_v2: 85,
    total_accounts: 10,
    open_tickets: 5,
    urgent_tickets: 1,
    renewals_90d: 4,
    renewals_30d: 2,
    renewals_at_risk: 1,
    renewals_at_risk_value: 15000,
    avg_csat: 4.5,
    avg_ces: 4.2,
    onboarding_active: 3,
    onboarding_stalled: 0,
    onboarding_completed: 10,
    expansion_opportunities: 5,
    expansion_pipeline_value: 25000,
    upcoming_qbrs_30d: 2,
  },
  accounts: [
    { id: "1", name: "Account A", tier: "Enterprise", health_v2: 90, annual_revenue: 50000, open_tickets: 1 },
    { id: "2", name: "Account B", tier: "Pro", health_v2: 70, annual_revenue: 20000, open_tickets: 2 },
  ],
  tickets: [
    { id: "t1", status: "open", created_at: new Date().toISOString() }
  ],
  renewals: [
    { id: "r1", renewal_date: new Date().toISOString(), contract_value: 1000 }
  ],
  usage: [],
  onboarding: [],
  expansion: [],
  surveys: [],
  qbrs: [],
  orders: [
    { id: "o1", account_id: "1", order_number: "ORD-001", status: "delivered", total: 1000, created_at: new Date().toISOString() },
    { id: "o2", account_id: "2", order_number: "ORD-002", status: "cancelled", total: 500, created_at: new Date().toISOString(), cancellation_reason: "Erro no pedido" },
  ],
};

describe("CustomerSuccess360Hub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders loading state with skeletons", () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    // Check for skeleton divs (standard for shadcn skeletons in this app)
    const skeletons = document.querySelectorAll("div.animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state with retry option", () => {
    const refetch = vi.fn();
    (useCustomerSuccess360 as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network Error"),
      refetch,
    });

    render(<CustomerSuccess360Hub />);
    
    expect(screen.getByText("Ops! Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText("Network Error")).toBeInTheDocument();
    
    const retryButton = screen.getByText(/Tentar novamente/i);
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });

  it("renders dashboard with data correctly", () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    expect(screen.getByText(/Health Médio/i)).toBeInTheDocument();
    expect(screen.getByText("85/100")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Tickets
    
    // Accounts are listed in the Accounts tab, let's switch to it or check if it's there
    // By default it shows "Visão Geral", accounts are in the bottom table or separate tab
    expect(screen.getByText(/Health por Conta/i)).toBeInTheDocument();
  });

  it("initializes state from localStorage", () => {
    localStorage.setItem("cs360_state_period", "90");

    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    expect(screen.getByText(/Últimos 90 dias/i)).toBeInTheDocument();
  });

  it("resets filters when clicking reset button", async () => {
    localStorage.setItem("cs360_state_period", "90");
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    const resetButton = screen.getByText(/Resetar Filtros/i);
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(localStorage.getItem("cs360_state_period")).toBe("30");
    });
  });

  it("exports PDF when clicking export button", () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    const exportButton = screen.getByText("PDF");
    fireEvent.click(exportButton);
    
    expect(vi.mocked(require("jspdf").jsPDF)).toHaveBeenCalled();
  });

  it("opens order modal and filters by search", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    // Find the delivered orders card/stat
    const deliveredStat = screen.getByText(/Pago\/Entregue/i);
    fireEvent.click(deliveredStat);

    // Modal should be open
    expect(screen.getByText(/Detalhes dos Pedidos/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar por pedido/i);
    fireEvent.change(searchInput, { target: { value: "ORD-999" } });

    await waitFor(() => {
      expect(screen.getByText(/Nenhum pedido encontrado/i)).toBeInTheDocument();
    });
  });

  it("handles pagination in orders modal", async () => {
    const manyOrders = Array.from({ length: 15 }, (_, i) => ({
      id: `o${i}`,
      account_id: "1",
      order_number: `ORD-${i}`,
      status: "delivered",
      total: 100,
      created_at: new Date().toISOString(),
    }));

    (useCustomerSuccess360 as any).mockReturnValue({
      data: { ...mockData, orders: manyOrders },
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    fireEvent.click(screen.getByText(/Pago\/Entregue/i));

    expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /Próxima/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Página 2 de 2/i)).toBeInTheDocument();
    });
  });
});
