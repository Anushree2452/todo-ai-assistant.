import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, normRole, tokenStore } from "./api";
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

  /** Log in with the given call; the backend returns the token plus the user's name and role. */
  const signIn = async (call: typeof api.login, email: string, password: string) => {
    const res = await call(email, password);
    tokenStore.set(res.access_token);
    try {
      let { name: nm, role: rr } = res;
      if (!nm || !rr) { const me = await api.me(); nm = me.name; rr = me.role; } // fallback if not in response
      const rl = normRole(rr);
      localStorage.setItem("taskly_name", nm!); localStorage.setItem("taskly_role", rl);
      setName(nm!); setRole(rl); setLoggedIn(true);
      return rl;
    } catch (e) { tokenStore.clear(); throw e; }
  };

  const login = (email: string, password: string) => signIn(api.login, email, password);
  const adminLogin = async (email: string, password: string) => { await signIn(api.adminLogin, email, password); }; // backend returns 403 for non-admins
  const register = async (n: string, email: string, password: string) => {
    await api.register(n, email, password); // public sign-up always creates role=user (enforced by backend)
    await login(email, password);
  };
  const logout = () => {
    tokenStore.clear(); localStorage.removeItem("taskly_role"); setRole("user"); setLoggedIn(false);
  };

  return <Ctx.Provider value={{ loggedIn, name, role, login, adminLogin, register, logout }}>{children}</Ctx.Provider>;
}
