import { useState } from "react";
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { Brand, initial } from "./components";
import type { Role } from "./types";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserTasks from "./pages/admin/AdminUserTasks";

const home = (role: Role) => (role === "admin" ? "/admin" : "/");

function pageInfo(path: string): [string, string] {
  if (path === "/admin") return ["Overview", "Progress of every user at a glance."];
  if (path === "/admin/users") return ["Users", "All registered users and their tasks."];
  if (path.startsWith("/admin/users/")) return ["User tasks", "Read-only view of this user's tasks."];
  if (path === "/tasks") return ["All Tasks", "Search, filter and manage your tasks."];
  return ["Dashboard", "Here is your productivity overview."];
}

/** Shell + guard: only signed-in accounts with `role` get in; everyone else is sent to the right place. */
function Protected({ role: required }: { role: Role }) {
  const { loggedIn, role, name, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!loggedIn) return <Navigate to={required === "admin" ? "/admin/login" : "/login"} replace />;
  if (role !== required) return <Navigate to={home(role)} replace />;

  const admin = required === "admin";
  const [title, sub] = pageInfo(pathname);
  const close = () => setOpen(false);
  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Brand />
        <div className="nav-label">{admin ? "ADMIN" : "WORKSPACE"}</div>
        {admin ? (
          <>
            <NavLink className="nav" to="/admin" end onClick={close}><span className="nav-icon">▦</span>Overview</NavLink>
            <NavLink className="nav" to="/admin/users" onClick={close}><span className="nav-icon">☷</span>Users</NavLink>
          </>
        ) : (
          <>
            <NavLink className="nav" to="/" end onClick={close}><span className="nav-icon">▦</span>Dashboard</NavLink>
            <NavLink className="nav" to="/tasks" end onClick={close}><span className="nav-icon">☷</span>All Tasks</NavLink>
            <button className="nav" onClick={() => { close(); navigate("/tasks?new=1"); }}><span className="nav-icon">＋</span>Add a Task</button>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="nav-label">ACCOUNT</div>
          <button className="nav" onClick={logout}><span className="nav-icon">↪</span>Log Out</button>
          <div className="profile">
            <div className="avatar">{initial(name)}</div>
            <div><strong>{name || "User"}</strong><small>{admin ? "Administrator" : "Member"}</small></div>
          </div>
        </div>
      </aside>
      <div className={`backdrop ${open ? "open" : ""}`} onClick={close} />

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">{admin ? "ADMIN PORTAL" : "YOUR WORKSPACE"}</div>
            <h1>{title}{admin && <span className="role-pill">Admin</span>}</h1>
            <p className="welcome">{sub}</p>
          </div>
          <div className="top-actions">
            <button className="btn btn-secondary mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
            {!admin && <button className="btn btn-primary" onClick={() => navigate("/tasks?new=1")}>＋ New Task</button>}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { loggedIn, role } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={loggedIn ? <Navigate to={home(role)} replace /> : <Login />} />
      <Route path="/admin/login" element={loggedIn ? <Navigate to={home(role)} replace /> : <AdminLogin />} />

      <Route element={<Protected role="user" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
      </Route>

      <Route element={<Protected role="admin" />}>
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserTasks />} />
      </Route>

      <Route path="*" element={<Navigate to={loggedIn ? home(role) : "/login"} replace />} />
    </Routes>
  );
}
