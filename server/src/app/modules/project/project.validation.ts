import z from "zod";
import { ProjectStatus } from "./project.interface";

export const createProjectZodSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Project name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    description: z
      .string()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    deadline: z
      .string({ message: "Deadline is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for deadline",
      }),
    status: z
      .enum(Object.values(ProjectStatus) as [string, ...string[]])
      .optional(),
    members: z.array(z.string()).optional(),
  }),
});

export const updateProjectZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    deadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for deadline",
      })
      .optional(),
    status: z
      .enum(Object.values(ProjectStatus) as [string, ...string[]])
      .optional(),
    members: z.array(z.string()).optional(),
  }),
});
