# 💻 Next.js 14 Client — CollabSphere Frontend Workspace

This is the interactive frontend application for **CollabSphere**, built with Next.js 14, React 18, and TypeScript. The application uses a customized glassmorphic theme designed strictly using premium HSL color tokens and fluid CSS transition models without styling framework overhead.

---

## 📂 Folder Architecture

```text
client/
├── public/                 # Static assets (fonts, icons)
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── dashboard/      # Main analytics charts, KPIs, activity logs
│   │   ├── projects/       # Projects list, CRUD modals, member lookup widgets
│   │   │   └── [id]/       # Kanban workspace task columns
│   │   ├── tasks/          # Searchable, filterable tasks center list & slide drawers
│   │   ├── notifications/  # Alerts history clearing page
│   │   ├── login/          # Pre-filled click-to-login sandbox role card
│   │   ├── signup/         # User signup screen
│   │   ├── layout.tsx      # Root providers setup, sliding overlays, toasts
│   │   └── page.tsx        # Landing portal page
│   │
│   ├── components/         # Reusable Component modules
│   │   └── DashboardLayout.tsx # Collapsible sidebar menu and user notifications header
│   │
│   └── context/            # React Context State Providers
│       ├── AuthContext.tsx # JWT session cookier, fetch helpers, and dynamic toasts
│       └── ThemeContext.tsx# HSL Theme configuration and toggle methods
│
├── package.json
└── tsconfig.json
```

---

## 🎨 HSL Glassmorphic Theme System

The user interface uses a tailorable light/dark HSL token theme defined inside [globals.css](file:///c:/Projects/templates/task-collaboration-system/client/src/app/globals.css).

Key styling features:
-   **Theme Switching**: Context-driven theme toggling via `ThemeContext` updating CSS classes.
-   **Frosted Visuals**: Glass panels are rendered using standard `.glass-panel` backing custom HSL gradient reflections.
-   **Micro-Animations**: Features custom CSS keyframe spins, fade-ins, and scale transitions on actions like sidebar collapses and kanban hover effects.

---

## ⚡ Key Frontend Features

1.  **Auth State Context Hook**: Custom `useAuth()` hook provides secure fetch configurations, automatically injecting standard Bearer cookies and managing instant role logins.
2.  **Kanban Boards**: The Project detail board aggregates task data, categorizes tasks into Kanban statuses (`Todo`, `In Progress`, `Completed`), and visualizes progress percentage bars.
3.  **Search & Sort Panel**: The Tasks Center page implements unified title/content querying, sorting options, and overdue deadline warnings.
4.  **Discussion and Assets Drawer**: Task rows click open a rich collaborative overlay allowing users to add comments and link folder assets on the fly.
5.  **Notifications Polling Hub**: A polling handler triggers header badge indicators when tasks are assigned or updated.

---

## 🏃 Getting Started

### 1. Installation
Install project dependencies inside `/client`:
```bash
pnpm install
```

### 2. Startup Development Server
Start the frontend dev environment:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
