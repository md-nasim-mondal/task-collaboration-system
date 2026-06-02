import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { TaskControllers } from "./task.controller";
import { createTaskZodSchema, updateTaskZodSchema } from "./task.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.PROJECT_MANAGER),
  validateRequest(createTaskZodSchema),
  TaskControllers.createTask
);

// Accessible by all, but the service internally restricts Team Members to status/comment edits only
router.patch(
  "/:id",
  checkAuth(),
  validateRequest(updateTaskZodSchema),
  TaskControllers.updateTask
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.PROJECT_MANAGER),
  TaskControllers.deleteTask
);

router.get("/:id", checkAuth(), TaskControllers.getTaskById);
router.get("/", checkAuth(), TaskControllers.getAllTasks);

// Comments and Attachments
router.post("/:id/comments", checkAuth(), TaskControllers.addComment);
router.post("/:id/attachments", checkAuth(), TaskControllers.addAttachment);

export const TaskRoutes = router;
