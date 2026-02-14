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
    // Send auth token immediately upon connection if your backend expects it in the first message
    // OR backend might use query param. 
    // For now, standard auth header isn't supported in browser WebSocket API. 
    // We'll rely on the handshake or first message.
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
  // Basic download via link, assuming auth via cookie or query param if needed. 
  // Implementing direct fetch download with auth header:
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
  // Check if we need a signed URL or can just pass the token in query (less secure) or assume session
  // For now return direct link, user might need to handle auth
  return `${API_URL}/files/${fileId}?token=${AUTH_TOKEN}`;
}

export { API_URL, WS_URL };
