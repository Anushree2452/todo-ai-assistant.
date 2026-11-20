import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { StatusBar, initial } from "../../components";
import type { AdminUser } from "../../types";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(""); const [q, setQ] = useState("");
  useEffect(() => { api.adminUsers().then(setUsers).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="error">{error}</div>;
  if (!users) return <p className="muted">Loading users…</p>;

  const needle = q.trim().toLowerCase();
  const shown = users.filter((u) => !needle || u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle));

  return (
    <section className="panel">
      <div className="panel-header">
        <div><h2>Registered Users</h2><p>Open a user to see what they are working on.</p></div>
        <span className="muted">{shown.length} {shown.length === 1 ? "user" : "users"}</span>
      </div>
      <div className="toolbar">
        <input type="search" placeholder="⌕ Search by name or email..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
      </div>
      {shown.length === 0 ? <div className="empty"><h3>No users match</h3></div> : (
        <div className="task-list">
          {shown.map((u) => (
            <div className="task-row" key={u.id}>
              <div className="avatar">{initial(u.name)}</div>
              <div className="task-content">
                <Link className="row-link" to={`/admin/users/${u.id}`}>{u.name}</Link>{u.role === "admin" && <span className="role-pill">Admin</span>}
                <div className="task-description">{u.email} · joined {u.created_at.slice(0, 10)}</div>
                <div className="task-meta">
                  <span className="badge pending">Pending {u.pending}</span>
                  <span className="badge in-progress">In progress {u.in_progress}</span>
                  <span className="badge completed">Completed {u.completed}</span>
                </div>
                {u.total > 0 && <div className="mt"><StatusBar pending={u.pending} in_progress={u.in_progress} completed={u.completed} /></div>}
              </div>
              <div className="task-actions"><Link className="btn btn-secondary btn-sm" to={`/admin/users/${u.id}`}>View tasks</Link></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
