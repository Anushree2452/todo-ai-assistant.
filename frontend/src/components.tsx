import type { ReactNode } from "react";
import type { Priority, Status, Task } from "./types";

export const STATUS_LABEL: Record<Status, string> = { pending: "Pending", in_progress: "In progress", completed: "Completed" };
export const PRIORITY_LABEL: Record<Priority, string> = { low: "Low", medium: "Medium", high: "High" };
export const statusClass = (s: Status) => s.replace("_", "-");
export const today = () => new Date().toISOString().slice(0, 10);
export const isOverdue = (t: Task) => t.status !== "completed" && !!t.due_date && t.due_date < today();
export const initial = (name: string) => (name.trim()[0] ?? "U").toUpperCase();

export function Brand() {
  return <div className="brand"><div className="brand-icon">✓</div>TaskFlow</div>;
}

export function StatCard({ label, value, hint, icon }: { label: string; value: number; hint: string; icon: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span><span className="stat-icon">{icon}</span>
      <strong>{value}</strong><small>{hint}</small>
    </div>
  );
}

/** Stacked completed / in-progress / pending bar. */
export function StatusBar({ pending, in_progress, completed }: { pending: number; in_progress: number; completed: number }) {
  return (
    <div className="bar" role="img" aria-label={`${pending} pending, ${in_progress} in progress, ${completed} completed`}>
      <i className="s-completed" style={{ flex: completed }} /><i className="s-in_progress" style={{ flex: in_progress }} /><i className="s-pending" style={{ flex: pending }} />
    </div>
  );
}

export function Legend({ pending, in_progress, completed }: { pending: number; in_progress: number; completed: number }) {
  return (
    <ul className="legend">
      <li><i className="dot s-pending" />Pending {pending}</li>
      <li><i className="dot s-in_progress" />In progress {in_progress}</li>
      <li><i className="dot s-completed" />Completed {completed}</li>
    </ul>
  );
}

/** One task row. Pass onToggle for a checkbox and `actions` for buttons; omit both for a read-only row. */
export function TaskRow({ task: t, onToggle, actions }: { task: Task; onToggle?: () => void; actions?: ReactNode }) {
  return (
    <div className="task-row">
      {onToggle && <input type="checkbox" className="task-check" checked={t.status === "completed"} onChange={onToggle}
        aria-label={`Mark "${t.title}" ${t.status === "completed" ? "pending" : "complete"}`} />}
      <div className="task-content">
        <div className={`task-title ${t.status === "completed" ? "completed-title" : ""}`}>{t.title}</div>
        {t.description && <div className="task-description">{t.description}</div>}
        <div className="task-meta">
          <span className={`badge ${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
          <span className={`badge ${statusClass(t.status)}`}>{STATUS_LABEL[t.status]}</span>
          {t.due_date && <span className={isOverdue(t) ? "due late" : "due"}>{isOverdue(t) ? "Overdue: " : "Due "}{t.due_date}</span>}
        </div>
      </div>
      {actions && <div className="task-actions">{actions}</div>}
    </div>
  );
}
