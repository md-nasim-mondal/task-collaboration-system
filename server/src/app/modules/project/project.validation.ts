import z from "zod";
import { ProjectStatus } from "./project.interface";

export const createProjectZodSchema = z.object({
  name: z
    .string({ error: "Project name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  deadline: z.string({ error: "Deadline is required" }),
  status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]).optional(),
  members: z.array(z.string()).optional(),
});

export const updateProjectZodSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional(),
  status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]).optional(),
  members: z.array(z.string()).optional(),
});
