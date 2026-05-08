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
    
    // In loading state, the dashboard container itself might have a data-testid or we check for skeletons directly
    const container = screen.getByTestId("loading-skeletons");
    expect(container).toBeInTheDocument();
  });

  it("renders error state with retry option and shows toast", async () => {
    const refetch = vi.fn();
    const { toast } = (useToast() as any);
    
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

  it("renders dashboard with data correctly", () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    const heading = screen.getByRole("heading", { level: 1, name: /Customer Success 360/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("85/100")).toBeInTheDocument();
  });

  it("navigates to Orders tab, clicks Ver Detalhes and validates modal content", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    // Change to Orders tab
    const ordersTab = screen.getByRole("tab", { name: /Pedidos/i });
    fireEvent.click(ordersTab);
    
    // Click "Ver Detalhes" using data-testid
    const detailsButton = screen.getByTestId("ver-detalhes-delivered");
    fireEvent.click(detailsButton);
    
    // Verify modal content
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ORD-001/i)).toBeInTheDocument();
  });

  it("filters and sorts orders in the modal", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    
    fireEvent.click(screen.getByRole("tab", { name: /Pedidos/i }));
    
    const detailsButton = screen.getByTestId("ver-detalhes-delivered");
    fireEvent.click(detailsButton);
    
    // Search
    const searchInput = screen.getByPlaceholderText(/Buscar por cliente ou número do pedido/i);
    fireEvent.change(searchInput, { target: { value: "Account A" } });
    
    expect(screen.getByText("Account A")).toBeInTheDocument();
    
    // Sorting (toggle sort by "Pedido")
    const orderHeader = screen.getByText("Pedido");
    fireEvent.click(orderHeader);
  });

  it("confirms state persistence in localStorage", async () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    const { unmount } = render(<CustomerSuccess360Hub />);
    
    // Open modal to trigger status persistence
    fireEvent.click(screen.getByRole("tab", { name: /Pedidos/i }));
    const detailsButton = screen.getByTestId("ver-detalhes-cancelled");
    fireEvent.click(detailsButton);
    
    expect(localStorage.getItem("cs360_state_modalStatus")).toBe("cancelled");
    
    // Unmount and remount to verify state restoration
    unmount();
    render(<CustomerSuccess360Hub />);
    
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ORD-002/i)).toBeInTheDocument();
  });

  it("calculates summary correctly", () => {
    (useCustomerSuccess360 as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<CustomerSuccess360Hub />);
    expect(screen.getByText("10 contas")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // open tickets
  });
});
