const API_URL = import.meta.env.VITE_API_URL || "https://solutioniq.cloud/api/v1";

const WS_URL = import.meta.env.VITE_WS_URL || "wss://solutioniq.cloud/api/v1/ws/stream";

const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    "Authorization": `Bearer ${AUTH_TOKEN}`,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  // Handle empty responses (like 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const url = `${API_URL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      body: formData,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload Error ${res.status}: ${errorText}`);
    }
    return res.json() as Promise<T>;
  },
  healthCheck: async (): Promise<boolean> => {
    try {
      await request("/agent/status");
      return true;
    } catch {
      return false;
    }
  },
};

export function createWebSocket(onMessage: (data: unknown) => void, onError?: (err: Event) => void) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    // Send auth token immediately upon connection
    ws.send(JSON.stringify({ type: "auth", token: AUTH_TOKEN }));
  };

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
  const url = `${API_URL}/files/${fileId}`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${AUTH_TOKEN}`,
    }
  });

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export function getFilePreviewUrl(fileId: string): string {
  return `${API_URL}/files/${fileId}?token=${AUTH_TOKEN}`;
}

export { API_URL, WS_URL, AUTH_TOKEN };
