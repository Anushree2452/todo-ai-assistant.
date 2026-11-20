import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { Brand } from "../components";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (mode === "register" && password.length < 8) return setError("Use a password with at least 8 characters.");
    setBusy(true);
    try { mode === "login" ? await login(email, password) : await register(name.trim(), email, password); }
    catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={submit}>
        <Brand />
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="subtitle">{mode === "login" ? "Sign in to organise your day." : "A clearer day starts with a plan."}</p>
        {mode === "register" && (
          <div className="field"><label htmlFor="n">Full name</label><input id="n" required maxLength={60} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
        )}
        <div className="field"><label htmlFor="e">Email address</label><input id="e" required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div className="field"><label htmlFor="p">Password</label><input id="p" required type="password" placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        <p className="auth-footer">
          {mode === "login" ? "New to TaskFlow? " : "Already registered? "}
          <button type="button" className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="auth-footer"><Link to="/admin/login" className="text-button">Admin? Log in here</Link></p>
      </form>
    </div>
  );
}
