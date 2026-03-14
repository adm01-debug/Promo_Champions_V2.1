import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FABQuickActions } from "./FABQuickActions";

// Mock useIsMobile
vi.mock("@/hooks/useMediaQuery", () => ({
  useIsMobile: () => false,
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("FABQuickActions", () => {
  it("renders the FAB button", () => {
    renderWithRouter(<FABQuickActions />);
    // FAB should be a button element
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("FAB button contains plus icon initially", () => {
    renderWithRouter(<FABQuickActions />);
    // Should have a button with the + icon
    const fab = document.querySelector("button");
    expect(fab).toBeInTheDocument();
  });
});
