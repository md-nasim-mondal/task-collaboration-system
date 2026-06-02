# 🚀 Node.js REST API Server — CollabSphere Backend

This is the backend API engine for **CollabSphere**, built with Node.js, Express, MongoDB (Mongoose), and TypeScript. It implements a clean modular architectural pattern, custom JWT token authentication via headers and secure state cookies, Zod request validations, and real-time business validation rules.

---

## 📂 Domain Modules Architecture

The `/server/src/app/modules` folder contains cleanly separated domain modules:

```text
server/src/app/modules/
├── auth/            # JWT Logins, Refresh tokens, Password recovery
├── user/            # User profiles registry & Verify endpoints
├── project/         # Projects CRUD workspace
├── task/            # Task columns Kanban, Comments thread, Attachments
├── activityLog/     # Shared timeline event tracker
├── notification/    # Polling notifications list & Clear handlers
└── dashboard/       # Workload aggregated analytics
```

---

## 🔒 Custom JWT Authentication & Guard

-   **Middleware Guard**: The auth guard inside [checkAuth.ts](file:///c:/Projects/templates/task-collaboration-system/server/src/app/middlewares/checkAuth.ts) intercepts requests, extracts Bearer JWT tokens from headers or cookies, checks whether user profiles exist and are active, and validates role permissions.
-   **Security**: Integrated with **Helmet** to protect HTTP headers, **CORS** to control trusted domain configurations, and **Express Rate Limit** to block abuse.

---

## 🧬 Enforced Business Rules

The backend strictly validates transactional requests inside services and models:
1.  **Unique Task Titles per Project**: Inside [task.service.ts](file:///c:/Projects/templates/task-collaboration-system/server/src/app/modules/task/task.service.ts), task creation and title modification check if an existing active task in the same project carries the same title.
2.  **Assignee Restrictions on Completion**: Inside `task.service.ts`, changing the assignee of a task whose current status is `Completed` is strictly rejected.
3.  **Future Deadlines Only**: Inside Zod validation rules and database schemas, projects and tasks must carry deadline/due dates in the future.

---

## 🌱 Automatic Database Seeding

-   **Seeding**: On database connection startup ([server.ts](file:///c:/Projects/templates/task-collaboration-system/server/src/server.ts)), the seeder checks if mock sandbox credentials already exist in the database.
-   **Pre-Seeded Accounts**:
    *   **Admin**: `admin@example.com` / `Password123!`
    *   **Project Manager**: `pm@example.com` / `Password123!`
    *   **Team Member**: `member@example.com` / `Password123!`

---

## 📋 REST API Endpoints

### Auth Module
-   `POST /api/v1/auth/login` — Sign in with credentials.
-   `POST /api/v1/auth/logout` — Standard session cleanup.
-   `POST /api/v1/auth/refresh-token` — Request new access JWTs.
-   `POST /api/v1/auth/change-password` — Change password.

### User Module
-   `POST /api/v1/user/register` — Create new team account.
-   `GET /api/v1/user/all-users` — Fetch active team members directory.
-   `GET /api/v1/user/me` — Retrieve active profile.

### Projects Module
-   `GET /api/v1/projects` — Fetch all accessible projects.
-   `POST /api/v1/projects` — Create new workspace project.
-   `GET /api/v1/projects/:id` — Retrieve project details & member details.
-   `PATCH /api/v1/projects/:id` — Edit details or invite members.
-   `DELETE /api/v1/projects/:id` — Remove project workspace.

### Tasks Module
-   `GET /api/v1/tasks` — Retrieve task cards.
-   `POST /api/v1/tasks` — Register new task in project.
-   `PATCH /api/v1/tasks/:id` — Edit details or re-assign.
-   `POST /api/v1/tasks/:id/comments` — Write comment in discussion.
-   `POST /api/v1/tasks/:id/attachments` — Add file attachments links.

---

## 🏃 Setup & Dev Startup

### 1. Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or configured Atlas URL)

### 2. Startup Dev Server
Install dependencies and run standard hot-reload inside `/server`:
```bash
pnpm install
pnpm dev
```
The REST API server will bootstrap on [http://localhost:5000](http://localhost:5000).
