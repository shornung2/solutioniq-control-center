import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || "https://solutioniq.cloud/api/v1";
const WS_URL = import.meta.env.VITE_WS_URL || "wss://solutioniq.cloud/api/v1/ws/stream";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("api-proxy", {
    headers: {
      "x-target-path": endpoint,
      "x-target-method": options.method || "GET",
    },
    body: options.body ? JSON.parse(options.body as string) : undefined,
  });

  if (error) {
    throw new Error(`API Error: ${error.message}`);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  healthCheck: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke("api-proxy", {
        headers: {
          "x-target-path": "/agent/status",
          "x-target-method": "GET",
        },
      });
      return !error;
    } catch {
      return false;
    }
  },
};

export function createWebSocket(onMessage: (data: unknown) => void, onError?: (err: Event) => void) {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      onMessage(event.data);
    }
  };

  ws.onerror = (err) => onError?.(err);

  return ws;
}

export async function downloadFile(fileId: string, filename: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/api-proxy`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "x-target-path": `/files/${fileId}`,
      "x-target-method": "GET",
    },
  });

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function getFilePreviewUrl(fileId: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/api-proxy?file_id=${fileId}`;
}

export { API_URL, WS_URL };
