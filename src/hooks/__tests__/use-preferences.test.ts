import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePreferences } from "../use-preferences";

const STORAGE_KEY = "solutioniq_preferences";

describe("usePreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when localStorage is empty", () => {
    const { result } = renderHook(() => usePreferences());
    expect(result.current.prefs).toEqual({
      budgetAlertThreshold: 90,
      defaultTaskPriority: 3,
      autoArchiveCompleted: false,
      notificationsEnabled: true,
    });
  });

  it("loads saved values from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ budgetAlertThreshold: 50 }));
    const { result } = renderHook(() => usePreferences());
    expect(result.current.prefs.budgetAlertThreshold).toBe(50);
    expect(result.current.prefs.notificationsEnabled).toBe(true); // default merged
  });

  it("update() merges partial updates and persists", () => {
    const { result } = renderHook(() => usePreferences());
    act(() => result.current.update({ autoArchiveCompleted: true }));
    expect(result.current.prefs.autoArchiveCompleted).toBe(true);
    expect(result.current.prefs.budgetAlertThreshold).toBe(90);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.autoArchiveCompleted).toBe(true);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-json!!!");
    const { result } = renderHook(() => usePreferences());
    expect(result.current.prefs.budgetAlertThreshold).toBe(90);
  });
});
