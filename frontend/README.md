# TaskFlow frontend (React + TypeScript + Vite)

    npm install
    npm run dev        # http://localhost:5173, proxies /api -> http://localhost:8000

For production set VITE_API_URL to your FastAPI URL and enable CORS on the backend.

## API contract this UI expects (from the reference document)
- POST /api/auth/register  {name,email,password}            -> 201
- POST /api/auth/login     {email,password}                 -> {access_token, name?, role: "user"|"admin"}   (role is NEW)
- GET  /api/tasks?status=&q=&sort=   (sort: created_at | due_date | priority)  -> Task[]
- POST /api/tasks / PATCH /api/tasks/{id} / DELETE /api/tasks/{id} (204)
- Task: {id,title,description,status: pending|in_progress|completed, priority: low|medium|high, due_date, created_at}
- Errors: FastAPI-style {"detail": "..."}; a 401 logs the user out.
If your login uses OAuth2PasswordRequestForm (form-encoded "username"/"password"), change `api.login` in src/api.ts.


## Admin role (new requirement)

Two roles: **user** (own tasks only) and **admin** (read-only monitoring of everyone).
Frontend routes: `/login` + `/` + `/tasks` for users; `/admin/login` + `/admin` + `/admin/users` + `/admin/users/:id` for admins.
Each portal redirects the other role to its own home. Hiding links is only UX: **the backend must enforce roles.**

### Backend work needed (Backend team)
1. `users.role` column, `"user"` (default) | `"admin"`. Public `/api/auth/register` must ALWAYS create `user`.
   Seed the first admin via a script/env (e.g. ADMIN_EMAIL / ADMIN_PASSWORD), never through the API.
2. `/api/auth/login` adds `role` to its response and puts `role` in the JWT claims.
3. A `require_admin` dependency that returns **403** for non-admins; use it on every `/api/admin/*` route.
4. `GET /api/admin/users` -> list of
   `{id, name, email, role, created_at, pending, in_progress, completed, total}`
   (counts via one GROUP BY query, not one query per user).
5. `GET /api/admin/users/{id}/tasks?status=` -> `Task[]` (same shape as `/api/tasks`; 404 if user missing).
6. Existing `/api/tasks*` stay scoped to the caller. Admin does not edit or delete user tasks (read-only by design).
7. CORS/dev: nothing new; `/api` is already proxied.

### Acceptance checks (both teams)
- User token calling `/api/admin/users` gets 403; no token gets 401.
- Registering with `"role":"admin"` in the body is ignored.
- Admin logging in at `/login` lands on `/admin`; a user logging in at `/admin/login` is rejected.
- Overview totals equal the sum of per-user counts; "In progress" per user matches that user's `/tasks?status=in_progress`.

### Decisions to confirm
- Single login endpoint + role in response (chosen) vs. a separate `/api/auth/admin/login`. Say so if you prefer the latter; it is a one-line change in `auth.tsx`.
- Overview totals are computed on the client from `/api/admin/users` (no extra endpoint). Add `/api/admin/stats` if the user count gets large.

## Styling
The look comes from the team's UI/UX design (`frontend/index.html` in the group repo: sidebar layout, stat cards, badges, task modal).
It is rebuilt here in React; shared pieces are in `src/components.tsx` and all styles in `src/styles.css`.
