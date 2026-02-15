import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BudgetMonitor } from "../BudgetMonitor";

const mockBudgetData = vi.fn();
vi.mock("@/hooks/use-dashboard", () => ({
  useBudgetUsage: () => mockBudgetData(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

const baseBudget = {
  daily_used: 5,
  daily_limit: 10,
  daily_pct: 50,
  monthly_used: 40,
  monthly_limit: 100,
  monthly_pct: 40,
  is_paused: false,
  hard_stop_enabled: false,
};

describe("BudgetMonitor", () => {
  it("renders skeleton when loading", () => {
    mockBudgetData.mockReturnValue({ data: undefined, isLoading: true });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.getByText("Budget Monitor")).toBeInTheDocument();
  });

  it("renders null when no data", () => {
    mockBudgetData.mockReturnValue({ data: undefined, isLoading: false });
    const { container } = render(<BudgetMonitor />, { wrapper });
    expect(container.innerHTML).toBe("");
  });

  it("shows daily and monthly percentages", () => {
    mockBudgetData.mockReturnValue({ data: baseBudget, isLoading: false });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByText("40.0%")).toBeInTheDocument();
  });

  it("shows dollar amounts", () => {
    mockBudgetData.mockReturnValue({ data: baseBudget, isLoading: false });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.getByText("$5.00 / $10.00")).toBeInTheDocument();
    expect(screen.getByText("$40.00 / $100.00")).toBeInTheDocument();
  });

  it("shows Paused badge", () => {
    mockBudgetData.mockReturnValue({ data: { ...baseBudget, is_paused: true }, isLoading: false });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("shows Hard Stop badge", () => {
    mockBudgetData.mockReturnValue({ data: { ...baseBudget, hard_stop_enabled: true }, isLoading: false });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.getByText("Hard Stop")).toBeInTheDocument();
  });

  it("shows warning when pct > 90", () => {
    mockBudgetData.mockReturnValue({ data: { ...baseBudget, daily_pct: 95 }, isLoading: false });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.getByText(/Budget approaching limit/)).toBeInTheDocument();
  });

  it("does not show warning when pct < 75", () => {
    mockBudgetData.mockReturnValue({ data: baseBudget, isLoading: false });
    render(<BudgetMonitor />, { wrapper });
    expect(screen.queryByText(/Budget approaching limit/)).toBeNull();
  });
});
