const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  list: () => request("/tasks"),
  create: (body: unknown) => request("/tasks", { method: "POST", body: JSON.stringify(body) }),
  get: (id: string) => request(`/tasks/${id}`),
  update: (id: string, body: unknown) =>
    request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) => fetch(`${BASE}/tasks/${id}`, { method: "DELETE" }),
};
