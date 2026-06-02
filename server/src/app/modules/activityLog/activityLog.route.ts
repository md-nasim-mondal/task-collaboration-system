import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ActivityLogControllers } from "./activityLog.controller";

const router = Router();

router.get("/", checkAuth(), ActivityLogControllers.getAllActivityLogs);

export const ActivityLogRoutes = router;
