import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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

// Mock jsPDF
vi.mock("jspdf", () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      text: vi.fn(),
      save: vi.fn(),
      autoTable: vi.fn(),
    }))
  };
});

// Mock scrollIntoView for Radix Select
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

vi.mock("papaparse", () => ({
  default: {
    unparse: vi.fn(() => "mock-csv-content"),
  },
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
  tickets: [],
  renewals: [],
  usage: [],
  onboarding: [],
  expansion: [],
  surveys: [],
  qbrs: [],
  orders: [
    { id: "o1", account_id: "1", order_number: "ORD-001", status: "delivered", total: 1000, created_at: new Date().toISOString() },
    { id: "o2", account_id: "2", order_number: "ORD-002", status: "cancelled", total: 500, created_at: new Date().toISOString(), cancellation_reason: "Erro no pedido" },
    { id: "o3", account_id: "1", order_number: "ORD-003", status: "pending", total: 1500, created_at: new Date().toISOString() },
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
    
    const container = screen.getByTestId("loading-skeletons");
    expect(container).toBeInTheDocument();
  });

  it("renders error state with retry option and shows toast", async () => {
    const refetch = vi.fn();
    (useCustomerSuccess360 as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Falha ao carregar pedidos"),
      refetch,
    });

    render(<CustomerSuccess360Hub />);
    
    expect(screen.getByText("Ops! Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText("Falha ao carregar pedidos")).toBeInTheDocument();
    
    const retryButton = screen.getByRole("button", { name: /Tentar novamente/i });
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });

  it("validates that changing the status filter in the Orders tab updates the results in the modal", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    // Change to Orders tab
    fireEvent.click(screen.getByText("Pedidos"));
    
    // Check "Entregues" (delivered)
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    expect(await screen.findByText(/ORD-001/i)).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByRole("button", { name: /Fechar/i }));
    
    // Check "Cancelados"
    fireEvent.click(screen.getByTestId("ver-detalhes-cancelled"));
    expect(await screen.findByText(/ORD-002/i)).toBeInTheDocument();
  });

  it("displays 'no results' correctly when there are no orders", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: { ...mockData, orders: [] },
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    // Switch to Orders tab
    fireEvent.click(screen.getByText("Pedidos"));
    
    // Check main table empty state
    expect(screen.getByText(/Nenhum pedido encontrado/)).toBeInTheDocument();
    
    // Trigger modal - it should have 0 orders
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    expect(await screen.findByText(/Nenhum pedido encontrado com os filtros atuais/)).toBeInTheDocument();
  });

  it("confirms table sorting when toggling the 'Cliente' header", async () => {
    const manyOrdersData = {
      ...mockData,
      accounts: [
        { id: "1", name: "Account A", tier: "Enterprise", health_v2: 90, annual_revenue: 50000, open_tickets: 1 },
        { id: "2", name: "Account B", tier: "Pro", health_v2: 70, annual_revenue: 20000, open_tickets: 2 },
      ],
      orders: [
        { id: "o1", account_id: "1", order_number: "A-001", status: "delivered", total: 100, created_at: "2024-01-01T10:00:00Z" },
        { id: "o2", account_id: "2", order_number: "B-001", status: "delivered", total: 200, created_at: "2024-01-02T10:00:00Z" },
      ]
    };
    (useCustomerSuccess360 as any).mockReturnValue({
      data: manyOrdersData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    fireEvent.click(screen.getByText("Pedidos"));
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    
    // Wait for modal content
    const clientHeader = await screen.findByText("Cliente");
    
    // First click: asc sorting
    fireEvent.click(clientHeader);
    let rows = await screen.findAllByRole("row");
    expect(rows[1]).toHaveTextContent("Account A");
    
    // Second click: desc sorting
    fireEvent.click(clientHeader);
    rows = await screen.findAllByRole("row");
    expect(rows[1]).toHaveTextContent("Account B");
  });

  it("verifies pagination updates the displayed items and doesn't break the modal", async () => {
    const paginatedOrders = Array.from({ length: 15 }, (_, i) => ({
      id: `p${i}`,
      account_id: "1",
      order_number: `PAG-${String(i).padStart(3, '0')}`,
      status: "delivered",
      total: 100,
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));
    
    (useCustomerSuccess360 as any).mockReturnValue({
      data: { ...mockData, orders: paginatedOrders },
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    fireEvent.click(screen.getByText("Pedidos"));
    fireEvent.click(screen.getByTestId("ver-detalhes-delivered"));
    
    // Find any PAG- (Wait for modal)
    await screen.findAllByText(/PAG-/);
    
    // Find page 2 button and click
    const page2Button = await screen.findByRole("button", { name: "2" });
    fireEvent.click(page2Button);
    
    // PAG-010 should now appear
    expect(await screen.findByText(/PAG-010/)).toBeInTheDocument();
  });

  it("verifies modal fields correspond to the selected order", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    fireEvent.click(screen.getByText("Pedidos"));
    fireEvent.click(screen.getByTestId("ver-detalhes-cancelled"));
    
    const modal = await screen.findByRole("dialog");
    const withinModal = within(modal);
    
    expect(withinModal.getByText(/ORD-002/)).toBeInTheDocument();
    // Use getAllByText for name if multiple elements exist
    expect(withinModal.getAllByText(/Account B/)[0]).toBeInTheDocument();
    expect(withinModal.getByText(/500,00/)).toBeInTheDocument();
    expect(withinModal.getByText(/Erro no pedido/)).toBeInTheDocument();
  });

  it("verifies modal fields correspond to the selected order", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    fireEvent.click(screen.getByRole("tab", { name: /Pedidos/i }));
    fireEvent.click(screen.getByTestId("ver-detalhes-cancelled"));
    
    const modal = await screen.findByRole("dialog");
    const withinModal = within(modal);
    
    expect(withinModal.getByText(/ORD-002/i)).toBeInTheDocument();
    expect(withinModal.getByText(/Account B/i)).toBeInTheDocument();
    expect(withinModal.getByText(/R\$ 500,00/i)).toBeInTheDocument();
    expect(withinModal.getByText(/Erro no pedido/i)).toBeInTheDocument();
  });
});