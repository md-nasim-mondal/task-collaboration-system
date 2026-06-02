import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { DashboardControllers } from "./dashboard.controller";

const router = Router();

router.get("/kpis", checkAuth(), DashboardControllers.getKPIs);
router.get("/project-progress", checkAuth(), DashboardControllers.getProjectProgress);
router.get("/workload", checkAuth(), DashboardControllers.getWorkload);
router.get("/charts", checkAuth(), DashboardControllers.getChartData);

export const DashboardRoutes = router;
