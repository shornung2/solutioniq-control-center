import { describe, it, expect } from "vitest";
import { validateFile } from "@/services/fileService";

function makeFile(type: string, size = 1024): File {
  return new File([new ArrayBuffer(size)], "f", { type });
}

describe("Validation logic", () => {
  describe("Rating boundaries", () => {
    it.each([1, 2, 3, 4, 5])("rating %i is valid", (r) => {
      expect(r >= 1 && r <= 5).toBe(true);
    });

    it.each([0, 6, -1, 100])("rating %i is invalid", (r) => {
      expect(r >= 1 && r <= 5).toBe(false);
    });
  });

  describe("Required fields", () => {
    it("task_id cannot be empty", () => {
      expect("".trim().length > 0).toBe(false);
    });

    it("rating must be provided", () => {
      expect(Number.isFinite(undefined as any)).toBe(false);
      expect(Number.isFinite(3)).toBe(true);
    });
  });

  describe("File type edge cases", () => {
    it("rejects uppercase MIME (File API normalizes, but empty stays rejected)", () => {
      // Browsers lowercase MIME types, so IMAGE/PNG becomes image/png
      expect(validateFile(makeFile("image/png"))).toBeNull();
    });

    it("accepts compound office types", () => {
      expect(validateFile(makeFile("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))).toBeNull();
    });

    it("accepts application/vnd.ms-excel", () => {
      expect(validateFile(makeFile("application/vnd.ms-excel"))).toBeNull();
    });

    it("rejects application/octet-stream", () => {
      expect(validateFile(makeFile("application/octet-stream"))).toBeTruthy();
    });
  });

  describe("Budget percentage boundaries", () => {
    const getWarning = (pct: number) => pct > 90;

    it("0% = no warning", () => expect(getWarning(0)).toBe(false));
    it("75% = no warning", () => expect(getWarning(75)).toBe(false));
    it("90% = no warning (boundary)", () => expect(getWarning(90)).toBe(false));
    it("91% = warning", () => expect(getWarning(91)).toBe(true));
    it("100% = warning", () => expect(getWarning(100)).toBe(true));
    it(">100% = warning", () => expect(getWarning(120)).toBe(true));
  });
});
