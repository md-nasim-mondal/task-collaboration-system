import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ProjectControllers } from "./project.controller";
import { createProjectZodSchema, updateProjectZodSchema } from "./project.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.PROJECT_MANAGER),
  validateRequest(createProjectZodSchema),
  ProjectControllers.createProject
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.PROJECT_MANAGER),
  validateRequest(updateProjectZodSchema),
  ProjectControllers.updateProject
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.PROJECT_MANAGER),
  ProjectControllers.deleteProject
);

router.get("/:id", checkAuth(), ProjectControllers.getProjectById);
router.get("/", checkAuth(), ProjectControllers.getAllProjects);

export const ProjectRoutes = router;
