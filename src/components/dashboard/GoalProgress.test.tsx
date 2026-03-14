import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { GoalProgress } from "./GoalProgress";

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("GoalProgress", () => {
  it("shows inline config UI when goal is 0", () => {
    renderWithRouter(<GoalProgress current={0} goal={0} />);
    expect(screen.getByText("Defina sua meta mensal")).toBeInTheDocument();
    expect(screen.getByText("Configurar Meta")).toBeInTheDocument();
  });

  it("shows percentage when goal > 0", () => {
    renderWithRouter(<GoalProgress current={5000} goal={10000} />);
    expect(screen.getByText("da meta atingida")).toBeInTheDocument();
  });

  it("shows motivational text at 100%", () => {
    renderWithRouter(<GoalProgress current={10000} goal={10000} />);
    expect(screen.getByText("🎉 Meta batida! Você é um campeão!")).toBeInTheDocument();
  });

  it("shows remaining amount when not at 100%", () => {
    renderWithRouter(<GoalProgress current={3000} goal={10000} />);
    expect(screen.getByText(/Faltam/)).toBeInTheDocument();
  });

  it("does not show remaining when goal is met", () => {
    renderWithRouter(<GoalProgress current={12000} goal={10000} />);
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument();
  });
});
