# 🚀 CollabSphere — Smart Project & Task Collaboration Workspace

CollabSphere is a premium, feature-rich full-stack team collaboration workspace. It is built using **Next.js App Router** with a customized glassmorphic design system on the frontend, and a modular **Node.js, Express, and MongoDB (Mongoose)** backend. The workspace includes strict real-time business validation rules, custom JWT session cookie routing, interactive Kanban boards, activity streams, and workloads analytics charts.

---

## ✨ System Architecture

The workspace is organized as a unified monorepo containing two distinct modules:
-   **`/client`**: Built on Next.js 14 (App Router) + TypeScript + Vanilla Tailwind-free CSS variables. Exposes collapsible layouts, polling notifications, drag-style dashboards, and sliding collaborative modal panels.
-   **`/server`**: Built on Express + TypeScript + Mongoose. Follows modular domain patterns and handles custom JWT token-based authentication, project status changes, activity logging, and workload aggregates.

```text
task-collaboration-system/
├── client/                 # Next.js 14 React Frontend Application
│   ├── src/
│   │   ├── app/            # Next.js Pages (Dashboard, Kanban, Tasks Center)
│   │   ├── components/     # UI Core Panels (Sidebars, Dialogs)
│   │   └── context/        # React Global State Providers (Auth, Theme)
│   └── package.json
│
├── server/                 # Express REST API Backend Server
│   ├── src/
│   │   ├── app/
│   │   │   ├── middlewares/# Auth Guards, Validator handlers
│   │   │   ├── modules/    # User, Project, Task, Notification, Dashboard Modules
│   │   │   └── utils/      # JWT, Mail, Auto-Seeder utilities
│   │   └── server.ts       # Database bootstrap and API entry point
│   └── package.json
│
└── README.md               # Main Workspace Documentation
```

---

## 🛠️ Tech Stack Core

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | Next.js 14 (App Router), React 18, TypeScript, Lucide Icons |
| **Frontend Styling** | Vanilla CSS custom variables, Premium HSL Theme systems |
| **Backend Core** | Node.js, Express, TypeScript |
| **Database** | MongoDB, Mongoose ODM |
| **Validation** | Zod (Request schema verification & validation rules) |
| **Security** | Helmet, CORS, Cookie Parser, Express Rate Limit |
| **Authentication** | Custom Bearer JWT & HTTP-Only Secure State Cookies |

---

## 🏃 Quick Start Guide

### 1. Database Connection
Ensure **MongoDB** is running locally or configured via your Atlas cluster. By default, both the server and seeder connect to a database named `task-collaboration-db`.

### 2. Backend API Setup
Open a terminal in the `/server` directory:
```bash
# 1. Install node server dependencies
pnpm install

# 2. Configure Environment variables
cp .env.example .env

# 3. Start the Hot-Reload API Server (runs at http://localhost:5000)
pnpm dev
```
> [!NOTE]
> The server has **Auto-Seeding on Startup**! Once it boots, it automatically seeds all three demo user roles into the database, so there is no need to run any extra seeding commands.

### 3. Frontend Client Setup
Open a second terminal window inside the `/client` directory:
```bash
# 1. Install client dependencies
pnpm install

# 2. Start Next.js Development Server (runs at http://localhost:3000)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Sandbox Login Credentials

CollabSphere features dynamic, pre-filled **instant login** buttons on the Login page, allowing you to instantly switch roles and inspect different permissions in the workspace:

| Role | Pre-Seeded Email | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@example.com` | `Password123!` | Full system access. Create/edit all projects, manage all memberships, create tasks, edit all statuses. |
| 💼 **Project Manager** | `pm@example.com` | `Password123!` | Create and manage projects, invite users, assign tasks. |
| 👥 **Team Member** | `member@example.com` | `Password123!` | Read assigned tasks. Modify assigned task statuses and collaborate in discussion threads only. |

---

## 🛡️ Business Validation Rules

The workspace implements strict transactional guards:
1.  **Duplicate Task Titles**: Restricts duplicate task names inside a single project (`"This task already exists in the project."`).
2.  **No Completed Reassignments**: Reassigning tasks already marked as `Completed` is strictly blocked (`"Completed tasks cannot be reassigned."`).
3.  **No Past Deadlines**: Prevents creating or updating projects/tasks with past due dates (`"Please select a valid deadline."`).

---

## 📝 License

This project is licensed under the MIT License. Feel free to use and build upon it!
