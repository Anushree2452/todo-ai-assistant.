import type { AdminUser, Role, Task, TaskInput } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "";
const KEY = "taskly_token";

export const tokenStore = {
  get: () => localStorage.getItem(KEY),
  set: (t: string) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (res.status === 401 && token) { tokenStore.clear(); window.dispatchEvent(new Event("auth:expired")); }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const d = (await res.json()).detail;
      msg = typeof d === "string" ? d : Array.isArray(d) ? d.map((e) => e.msg).join(", ") : msg;
    } catch { /* keep default */ }
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  register: (name: string, email: string, password: string) =>
    req<unknown>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    req<{ access_token: string; name?: string; role?: Role }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  listTasks: (p: { status?: string; q?: string; sort?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => v && qs.set(k, v));
    return req<Task[]>(`/api/tasks?${qs}`);
  },
  createTask: (t: TaskInput) => req<Task>("/api/tasks", { method: "POST", body: JSON.stringify(t) }),
  updateTask: (id: number, t: Partial<TaskInput>) => req<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(t) }),
  deleteTask: (id: number) => req<void>(`/api/tasks/${id}`, { method: "DELETE" }),

  // Admin-only (backend must return 403 for role=user)
  adminUsers: () => req<AdminUser[]>("/api/admin/users"),
  adminUserTasks: (userId: number, status?: string) =>
    req<Task[]>(`/api/admin/users/${userId}/tasks${status ? `?status=${status}` : ""}`),
};
