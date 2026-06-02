import z from "zod";
import { TaskPriority, TaskStatus } from "./task.interface";

export const createTaskZodSchema = z.object({
  title: z
    .string({ error: "Task title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
  project: z.string({ error: "Project ID is required" }),
  assignedMember: z.string().optional(),
  dueDate: z.string({ error: "Due date is required" }),
  priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
  status: z.enum(Object.values(TaskStatus) as [string, ...string[]]).optional(),
});

export const updateTaskZodSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional(),
  project: z.string().optional(),
  assignedMember: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
  status: z.enum(Object.values(TaskStatus) as [string, ...string[]]).optional(),
});
