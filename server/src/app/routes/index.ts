import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ProjectRoutes } from "../modules/project/project.route";
import { TaskRoutes } from "../modules/task/task.route";
import { ActivityLogRoutes } from "../modules/activityLog/activityLog.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/projects",
    route: ProjectRoutes,
  },
  {
    path: "/tasks",
    route: TaskRoutes,
  },
  {
    path: "/activity-logs",
    route: ActivityLogRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
