import { describe, it, expect, vi, beforeEach } from "vitest";
import { feedbackService } from "../feedbackService";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from "@/lib/api";

describe("feedbackService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("submit", () => {
    it("posts required fields", async () => {
      vi.mocked(api.post).mockResolvedValue({} as any);
      await feedbackService.submit({ task_id: "t1", rating: 4 });
      expect(api.post).toHaveBeenCalledWith("/feedback", { task_id: "t1", rating: 4 });
    });

    it("posts optional fields when provided", async () => {
      vi.mocked(api.post).mockResolvedValue({} as any);
      const payload = { task_id: "t2", rating: 5, comment: "great", accuracy_rating: 5 };
      await feedbackService.submit(payload);
      expect(api.post).toHaveBeenCalledWith("/feedback", payload);
    });
  });

  describe("getForTask", () => {
    it("calls correct endpoint", async () => {
      vi.mocked(api.get).mockResolvedValue({} as any);
      await feedbackService.getForTask("task-abc");
      expect(api.get).toHaveBeenCalledWith("/feedback/task/task-abc");
    });
  });

  describe("getStats", () => {
    it("calls correct endpoint", async () => {
      vi.mocked(api.get).mockResolvedValue({} as any);
      await feedbackService.getStats();
      expect(api.get).toHaveBeenCalledWith("/feedback/stats");
    });
  });
});
