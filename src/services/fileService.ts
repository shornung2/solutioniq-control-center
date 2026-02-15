import { api, downloadFile } from "@/lib/api";
import type { FileMetadata, FileListResponse } from "@/lib/types";

const ALLOWED_TYPES = [
  "image/",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument",
  "application/vnd.ms-",
  "application/msword",
  "text/",
  "application/json",
];

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export function validateFile(file: File): string | null {
  const allowed = ALLOWED_TYPES.some((t) => file.type.startsWith(t) || file.type.includes(t));
  if (!allowed) return `File type "${file.type || "unknown"}" is not supported.`;
  if (file.size > MAX_SIZE_BYTES) return `File exceeds 100MB limit.`;
  return null;
}

export async function uploadFile(file: File): Promise<FileMetadata> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<FileMetadata>("/files", formData);
}

export async function listFiles(limit = 20, offset = 0): Promise<FileListResponse> {
  return api.get<FileListResponse>(`/files?limit=${limit}&offset=${offset}`);
}

export async function deleteFileById(id: string): Promise<void> {
  await api.delete(`/files/${id}`);
}

export { downloadFile };
