import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { Brand } from "../components";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setBusy(true);
    try { await adminLogin(email, password); }
    catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={submit}>
        <Brand />
        <h1>Admin login</h1>
        <p className="subtitle">Sign in to monitor users and their tasks.</p>
        <div className="field"><label htmlFor="e">Email address</label><input id="e" required type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></div>
        <div className="field"><label htmlFor="p">Password</label><input id="p" required type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Please wait…" : "Sign in as admin"}</button>
        <p className="auth-footer">Not an admin? <Link to="/login" className="text-button">User login</Link></p>
      </form>
    </div>
  );
}
