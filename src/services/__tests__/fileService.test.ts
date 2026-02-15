import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateFile, uploadFile, listFiles, deleteFileById } from "../fileService";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
  downloadFile: vi.fn(),
}));

import { api } from "@/lib/api";

function makeFile(type: string, size = 1024, name = "test"): File {
  const buf = new ArrayBuffer(size);
  return new File([buf], name, { type });
}

describe("validateFile", () => {
  it("accepts image/png", () => {
    expect(validateFile(makeFile("image/png"))).toBeNull();
  });

  it("accepts application/pdf", () => {
    expect(validateFile(makeFile("application/pdf"))).toBeNull();
  });

  it("accepts text/plain", () => {
    expect(validateFile(makeFile("text/plain"))).toBeNull();
  });

  it("accepts application/json", () => {
    expect(validateFile(makeFile("application/json"))).toBeNull();
  });

  it("rejects application/zip", () => {
    expect(validateFile(makeFile("application/zip"))).toBeTruthy();
  });

  it("rejects video/mp4", () => {
    expect(validateFile(makeFile("video/mp4"))).toBeTruthy();
  });

  it("rejects empty type", () => {
    expect(validateFile(makeFile(""))).toBeTruthy();
  });

  it("accepts file at exactly 100MB", () => {
    expect(validateFile(makeFile("image/png", 100 * 1024 * 1024))).toBeNull();
  });

  it("rejects file over 100MB", () => {
    expect(validateFile(makeFile("image/png", 100 * 1024 * 1024 + 1))).toBeTruthy();
  });
});

describe("uploadFile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls api.upload with FormData containing the file", async () => {
    const file = makeFile("image/png");
    vi.mocked(api.upload).mockResolvedValue({ file_id: "1" } as any);
    await uploadFile(file);
    expect(api.upload).toHaveBeenCalledWith("/files", expect.any(FormData));
  });
});

describe("listFiles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls api.get with default limit/offset", async () => {
    vi.mocked(api.get).mockResolvedValue({ files: [], total: 0 });
    await listFiles();
    expect(api.get).toHaveBeenCalledWith("/files?limit=20&offset=0");
  });

  it("passes custom limit/offset", async () => {
    vi.mocked(api.get).mockResolvedValue({ files: [], total: 0 });
    await listFiles(10, 5);
    expect(api.get).toHaveBeenCalledWith("/files?limit=10&offset=5");
  });
});

describe("deleteFileById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls api.delete with correct endpoint", async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined as any);
    await deleteFileById("abc-123");
    expect(api.delete).toHaveBeenCalledWith("/files/abc-123");
  });
});
