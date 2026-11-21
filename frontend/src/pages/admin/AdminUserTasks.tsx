import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";
import { Legend, STATUS_LABEL, StatCard, StatusBar, TaskRow } from "../../components";
import type { AdminUser, Task } from "../../types";

export default function AdminUserTasks() {
  const uid = Number(useParams().id);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [status, setStatus] = useState(""); const [error, setError] = useState("");

  useEffect(() => {
    api.adminUsers().then((us) => setUser(us.find((u) => u.id === uid) ?? null)).catch((e) => setError(e.message));
  }, [uid]);
  useEffect(() => {
    setTasks(null);
    api.adminUserTasks(uid, status).then(setTasks).catch((e) => setError(e.message));
  }, [uid, status]);

  if (error) return <div className="error">{error}</div>;
  const pct = user && user.total ? Math.round((user.completed / user.total) * 100) : 0;

  return (
    <>
      <p style={{ marginBottom: 16 }}><Link className="text-button" to="/admin/users">← All users</Link></p>
      {user && (
        <>
          <div className="panel-header" style={{ padding: "0 0 4px" }}><div><h2 style={{ fontSize: 22 }}>{user.name}</h2><p>{user.email}</p></div></div>
          <div className="stats">
            <StatCard label="Total Tasks" value={user.total} hint="Assigned to this user" icon="☷" />
            <StatCard label="Pending" value={user.pending} hint="Waiting to be started" icon="◷" />
            <StatCard label="In Progress" value={user.in_progress} hint="Working on now" icon="↗" />
            <StatCard label="Completed" value={user.completed} hint="Finished" icon="✓" />
          </div>
          <section className="panel panel-body">
            <div className="progress-head"><span className="big">{pct}%</span><span className="muted">{user.completed} of {user.total} tasks completed</span></div>
            <StatusBar pending={user.pending} in_progress={user.in_progress} completed={user.completed} />
            <Legend pending={user.pending} in_progress={user.in_progress} completed={user.completed} />
          </section>
        </>
      )}

      <section className="panel">
        <div className="panel-header"><div><h2>Tasks</h2><p>Read-only. Admins monitor tasks; users manage their own.</p></div></div>
        <div className="toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {!tasks ? <p className="empty">Loading tasks…</p> : tasks.length === 0 ? <div className="empty"><h3>No tasks to show</h3></div> : (
          <div className="task-list">{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</div>
        )}
      </section>
    </>
  );
}
