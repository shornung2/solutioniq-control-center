import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedbackStars } from "../FeedbackStars";

const mutateMock = vi.fn();
vi.mock("@/hooks/use-feedback", () => ({
  useSubmitFeedback: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

describe("FeedbackStars", () => {
  it("renders 5 star buttons", () => {
    render(<FeedbackStars taskId="t1" />, { wrapper });
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("has radiogroup role", () => {
    render(<FeedbackStars taskId="t1" />, { wrapper });
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("calls submitFeedback on click", () => {
    mutateMock.mockClear();
    render(<FeedbackStars taskId="t1" />, { wrapper });
    fireEvent.click(screen.getByLabelText("3 star"));
    expect(mutateMock).toHaveBeenCalledWith({ task_id: "t1", rating: 3 });
  });

  it("shows Thanks! after selection", () => {
    render(<FeedbackStars taskId="t1" />, { wrapper });
    fireEvent.click(screen.getByLabelText("4 star"));
    expect(screen.getByText("Thanks!")).toBeInTheDocument();
  });
});
