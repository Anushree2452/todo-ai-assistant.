import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";
import type { Role } from "./types";

interface AuthCtx {
  loggedIn: boolean; name: string; role: Role;
  login: (email: string, password: string) => Promise<Role>;
  /** Admin portal login: rejects (and signs out) any account that is not an admin. */
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

const readRole = (): Role => (localStorage.getItem("taskly_role") === "admin" ? "admin" : "user");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(!!tokenStore.get());
  const [name, setName] = useState(localStorage.getItem("taskly_name") ?? "");
  const [role, setRole] = useState<Role>(readRole());

  useEffect(() => {
    const expire = () => setLoggedIn(false);
    window.addEventListener("auth:expired", expire);
    return () => window.removeEventListener("auth:expired", expire);
  }, []);

  const signIn = async (email: string, password: string) => {
    const r = await api.login(email, password);
    const rl: Role = r.role === "admin" ? "admin" : "user";
    return { r, rl };
  };
  const commit = (token: string, n: string, rl: Role) => {
    tokenStore.set(token);
    localStorage.setItem("taskly_name", n); localStorage.setItem("taskly_role", rl);
    setName(n); setRole(rl); setLoggedIn(true);
  };

  const login = async (email: string, password: string) => {
    const { r, rl } = await signIn(email, password);
    commit(r.access_token, r.name ?? email.split("@")[0], rl);
    return rl;
  };
  const adminLogin = async (email: string, password: string) => {
    const { r, rl } = await signIn(email, password);
    if (rl !== "admin") throw new Error("This account does not have admin access.");
    commit(r.access_token, r.name ?? email.split("@")[0], rl);
  };
  const register = async (n: string, email: string, password: string) => {
    await api.register(n, email, password); // public sign-up always creates role=user (enforced by backend)
    await login(email, password);
  };
  const logout = () => {
    tokenStore.clear(); localStorage.removeItem("taskly_role"); setRole("user"); setLoggedIn(false);
  };

  return <Ctx.Provider value={{ loggedIn, name, role, login, adminLogin, register, logout }}>{children}</Ctx.Provider>;
}
