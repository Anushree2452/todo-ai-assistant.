import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { Legend, StatCard, StatusBar, initial } from "../../components";
import type { AdminUser } from "../../types";

export default function AdminOverview() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.adminUsers().then(setUsers).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="error">{error}</div>;
  if (!users) return <p className="muted">Loading overview…</p>;

  const people = users.filter((u) => u.role !== "admin");
  const sum = (k: "pending" | "in_progress" | "completed" | "total") => people.reduce((a, u) => a + u[k], 0);
  const pending = sum("pending"), progress = sum("in_progress"), done = sum("completed"), total = sum("total");
  const pct = total ? Math.round((done / total) * 100) : 0;
  const working = people.filter((u) => u.in_progress > 0).sort((a, b) => b.in_progress - a.in_progress).slice(0, 5);

  return (
    <>
      <div className="stats">
        <StatCard label="Registered Users" value={people.length} hint="Accounts in the system" icon="☺" />
        <StatCard label="Total Tasks" value={total} hint="Across all users" icon="☷" />
        <StatCard label="In Progress" value={progress} hint="Being worked on now" icon="↗" />
        <StatCard label="Completed" value={done} hint="Successfully finished" icon="✓" />
      </div>

      <section className="panel panel-body" aria-label="Overall progress">
        <div className="progress-head"><span className="big">{pct}%</span><span className="muted">{done} of {total} tasks completed across all users</span></div>
        <StatusBar pending={pending} in_progress={progress} completed={done} />
        <Legend pending={pending} in_progress={progress} completed={done} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div><h2>Working on tasks right now</h2><p>Users with tasks currently in progress.</p></div>
          <Link className="btn btn-secondary" to="/admin/users">All users →</Link>
        </div>
        {working.length === 0 ? <div className="empty">No tasks are in progress.</div> : (
          <div className="task-list">
            {working.map((u) => (
              <div className="task-row" key={u.id}>
                <div className="avatar">{initial(u.name)}</div>
                <div className="task-content">
                  <Link className="row-link" to={`/admin/users/${u.id}`}>{u.name}</Link>
                  <div className="task-description">{u.email}</div>
                </div>
                <span className="badge in-progress">{u.in_progress} in progress</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
