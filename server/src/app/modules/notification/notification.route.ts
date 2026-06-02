import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { NotificationControllers } from "./notification.controller";

const router = Router();

router.get("/", checkAuth(), NotificationControllers.getMyNotifications);
router.patch("/:id/read", checkAuth(), NotificationControllers.markNotificationRead);
router.post("/read-all", checkAuth(), NotificationControllers.markAllNotificationsRead);

export const NotificationRoutes = router;
